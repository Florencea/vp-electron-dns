import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import { z } from "zod";
import { APP_CONFIG } from "../src/shared/config.ts";

const PackageJsonSchema = z.object({
  name: z.string().optional(),
  productName: z.string().optional(),
});

async function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address !== null && typeof address === "object") {
        const port = address.port;
        server.close(() => {
          resolve(port);
        });
      } else {
        server.close(() => {
          reject(new Error("Unable to determine free port"));
        });
      }
    });
  });
}

async function waitForCdpReady(
  endpoint: string,
  maxAttempts = 30,
  intervalMs = 200,
): Promise<boolean> {
  const check = async (attempt: number): Promise<boolean> => {
    if (attempt >= maxAttempts) {
      return false;
    }
    try {
      const res = await fetch(`${endpoint}/json/version`);
      if (res.ok) {
        return true;
      }
    } catch {
      // Waiting for Electron browser process to start CDP listener
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    return check(attempt + 1);
  };

  return check(0);
}

function findExecutable(): string {
  const outDir = path.resolve(import.meta.dirname, "../out");
  if (!fs.existsSync(outDir)) {
    throw new Error(`Output directory not found at ${outDir}. Did you run "vpr app:pack"?`);
  }

  const entries = fs.readdirSync(outDir, { withFileTypes: true });
  const platformDirs = entries.filter((entry) => {
    if (!entry.isDirectory() || entry.name === "make") {
      return false;
    }
    if (process.platform === "darwin") {
      return entry.name.includes("darwin");
    }
    if (process.platform === "win32") {
      return entry.name.includes("win32");
    }
    return entry.name.includes("linux");
  });

  if (platformDirs.length === 0) {
    throw new Error(
      `No packaged output folder found for platform "${process.platform}" in ${outDir}. Available folders: ${entries.map((e) => e.name).join(", ")}`,
    );
  }

  for (const dir of platformDirs) {
    const fullDirPath = path.join(outDir, dir.name);

    if (process.platform === "darwin") {
      const subEntries = fs.readdirSync(fullDirPath, { withFileTypes: true });
      for (const app of subEntries) {
        if (app.isDirectory() && app.name.endsWith(".app")) {
          const macOSDir = path.join(fullDirPath, app.name, "Contents", "MacOS");
          if (fs.existsSync(macOSDir)) {
            const binEntries = fs.readdirSync(macOSDir);
            const firstBin = binEntries[0];
            if (firstBin !== undefined) {
              return path.join(macOSDir, firstBin);
            }
          }
        }
      }
    } else if (process.platform === "win32") {
      const subEntries = fs.readdirSync(fullDirPath);
      const exe = subEntries.find(
        (file) =>
          file.endsWith(".exe") &&
          !file.toLowerCase().includes("uninstall") &&
          !file.toLowerCase().includes("squirrel"),
      );
      if (exe !== undefined) {
        return path.join(fullDirPath, exe);
      }
    } else {
      // Linux
      const isExecutable = (filename: string): boolean => {
        try {
          const fullPath = path.join(fullDirPath, filename);
          const stat = fs.statSync(fullPath);
          return stat.isFile() && (stat.mode & 0o111) !== 0;
        } catch {
          return false;
        }
      };

      const subEntries = fs.readdirSync(fullDirPath);

      // Check package name or productName first
      const candidateNames: string[] = [];
      const pkgPath = path.resolve(import.meta.dirname, "../package.json");
      if (fs.existsSync(pkgPath)) {
        try {
          const raw: unknown = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
          const parsed = PackageJsonSchema.safeParse(raw);
          if (parsed.success) {
            if (parsed.data.name !== undefined) {
              candidateNames.push(parsed.data.name);
            }
            if (parsed.data.productName !== undefined) {
              candidateNames.push(parsed.data.productName);
            }
          }
        } catch {
          // ignore error and proceed with fallback
        }
      }
      candidateNames.push(APP_CONFIG.title);

      for (const name of candidateNames) {
        if (subEntries.includes(name) && isExecutable(name)) {
          return path.join(fullDirPath, name);
        }
      }

      // Fallback: exclude helper binaries, crashpad, and non-executable/dotted files
      const ignoredBinaries = new Set([
        "chrome-sandbox",
        "chrome_crashpad_handler",
        "crashpad_handler",
      ]);

      const exe = subEntries.find((file) => {
        if (
          file.includes(".") ||
          file.startsWith("chrome-") ||
          file.startsWith("chrome_") ||
          file.includes("crashpad") ||
          ignoredBinaries.has(file)
        ) {
          return false;
        }
        return isExecutable(file);
      });
      if (exe !== undefined) {
        return path.join(fullDirPath, exe);
      }
    }
  }

  throw new Error(
    `Unable to locate packaged executable for platform "${process.platform}" in ${outDir}`,
  );
}

async function runSmokeTest(): Promise<void> {
  const executablePath = findExecutable();
  console.log(`[smoke-test] Found packaged executable: ${executablePath}`);

  const port = await getAvailablePort();
  console.log(`[smoke-test] Using remote debugging port: ${port.toString()}`);

  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && key !== "ELECTRON_RUN_AS_NODE") {
      env[key] = value;
    }
  }

  const childArgs = [
    `--remote-debugging-port=${port.toString()}`,
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
  ];

  const appProcess = spawn(executablePath, childArgs, {
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const pageErrors: Error[] = [];

  const endpoint = `http://127.0.0.1:${port.toString()}`;
  const ready = await waitForCdpReady(endpoint);
  if (!ready) {
    appProcess.kill();
    throw new Error(`Electron application did not open CDP on ${endpoint} within timeout.`);
  }

  console.log("[smoke-test] Connecting over CDP...");
  const browser = await chromium.connectOverCDP(endpoint);

  try {
    const defaultContext = browser.contexts()[0] ?? (await browser.newContext());
    const existingPages = defaultContext.pages();
    const window =
      existingPages[0] ?? (await defaultContext.waitForEvent("page", { timeout: 10_000 }));

    window.on("pageerror", (error: Error) => {
      console.error("[smoke-test] Page error:", error);
      pageErrors.push(error);
    });

    console.log("[smoke-test] Waiting for DOMContentLoaded...");
    await window.waitForLoadState("domcontentloaded");

    const title = await window.title();
    console.log(`[smoke-test] Window title: "${title}"`);
    if (title.trim().length === 0) {
      throw new Error("Window title is empty! Document title was not properly set.");
    }

    console.log("[smoke-test] Verifying #root element render...");
    const rootLocator = window.locator("#root");
    await rootLocator.waitFor({ state: "attached", timeout: 10_000 });

    const innerHtml = await rootLocator.innerHTML();
    if (innerHtml.trim().length === 0) {
      throw new Error("Application #root element is empty! React failed to render UI.");
    }

    if (pageErrors.length > 0) {
      const errorMessages = pageErrors.map((err) => err.message).join("; ");
      throw new Error(`Encountered page errors during launch: ${errorMessages}`);
    }

    console.log(
      `[smoke-test] UI successfully rendered (${innerHtml.length.toString()} bytes of HTML).`,
    );
  } finally {
    console.log("[smoke-test] Closing application...");
    await browser.close().catch(() => {});
    appProcess.kill("SIGTERM");
  }

  console.log("[smoke-test] Smoke test passed successfully!");
}

runSmokeTest().catch((error: unknown) => {
  console.error("[smoke-test] Test failed:", error);
  process.exitCode = 1;
});
