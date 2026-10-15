import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";
import { electronDevPlugin } from "./scripts/electron-dev-plugin";

export default defineConfig(({ mode }) => {
  if (mode === "main") {
    return {
      build: {
        ssr: "src/main/index.ts",
        outDir: "dist/main",
      },
    };
  }

  if (mode === "preload") {
    return {
      build: {
        ssr: "src/preload/index.ts",
        outDir: "dist/preload",
        rolldownOptions: {
          output: {
            format: "cjs",
            entryFileNames: "index.cjs",
          },
          external: ["electron"],
        },
      },
      ssr: {
        noExternal: true,
      },
    };
  }

  return {
    run: {
      cache: {
        scripts: true,
        tasks: true,
      },
    },
    base: "./",
    server: {
      watch: {
        ignored: ["**/src/main/**", "**/src/preload/**"],
      },
    },
    build: {
      outDir: "dist/renderer",
      chunkSizeWarningLimit: 1000,
    },
    lint: {
      ignorePatterns: [
        "dist/**",
        "release/**",
        "out/**",
        ".cache/**",
        ".vitest/**",
        "test-results/**",
        "playwright-report/**",
        "blob-report/**",
      ],
      options: {
        typeAware: true,
        typeCheck: true,
      },
      categories: {
        correctness: "error",
        suspicious: "error",
        perf: "error",
      },
      plugins: ["react", "unicorn", "typescript", "oxc", "vitest", "promise"],
      rules: {
        "react/react-in-jsx-scope": "off",
      },
    },
    fmt: {
      ignorePatterns: [
        "dist/**",
        "release/**",
        "out/**",
        ".cache/**",
        ".vitest/**",
        "test-results/**",
        "playwright-report/**",
        "blob-report/**",
      ],
      sortPackageJson: true,
    },
    plugins: [
      react({
        compiler: true,
      }),
      tailwindcss(),
      electronDevPlugin(),
    ],
    test: {
      silent: "passed-only",
      allowOnly: !process.env.CI,
      projects: [
        {
          test: {
            name: "renderer",
            include: ["test/renderer/**/*.{test,spec}.{ts,tsx}"],
            setupFiles: ["./test/renderer/setup.ts"],
            browser: {
              enabled: true,
              provider: playwright(),
              headless: true,
              instances: [{ browser: "chromium" }],
            },
          },
        },
        {
          test: {
            name: "main",
            include: ["test/main/**/*.{test,spec}.ts", "test/canary/**/*.{test,spec}.ts"],
            environment: "node",
          },
        },
      ],
    },
  };
});
