import path from "node:path";
import { app, BrowserWindow, ipcMain, Menu, shell } from "electron";
import { APP_CONFIG } from "../shared/config";
import type { SupportedLocale } from "../shared/locales";
import { SupportedLocaleSchema } from "../shared/locales";
import { fetchHost, resolveHost } from "./dns";
import { createApplicationMenu } from "./menu";
import { getInitialLocale, saveSettings } from "./settings";

const icon = path.join(import.meta.dirname, "../../build/icon.png");

const createWindow = (): BrowserWindow => {
  const isDev = !app.isPackaged;
  const rendererUrl = process.env.ELECTRON_RENDERER_URL;
  const rendererHtml = path.join(import.meta.dirname, "../renderer/index.html");
  const preloadFile = path.join(import.meta.dirname, "../preload/index.cjs");

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 720,
    minHeight: 320,
    autoHideMenuBar: false,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: { preload: preloadFile },
    title: APP_CONFIG.title,
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev && rendererUrl !== undefined && rendererUrl.length > 0) {
    void mainWindow.loadURL(rendererUrl);
  } else {
    void mainWindow.loadFile(rendererHtml);
  }

  return mainWindow;
};

async function bootstrap(): Promise<void> {
  if (!app.requestSingleInstanceLock()) {
    app.quit();
    return;
  }

  await app.whenReady();
  app.setAppUserModelId(APP_CONFIG.appId);

  let currentLocale: SupportedLocale = await getInitialLocale();

  const handleLocaleChange = async (newLocale: SupportedLocale): Promise<void> => {
    currentLocale = newLocale;
    await saveSettings({ locale: newLocale });
    setAppMenu(newLocale);
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send("locale-changed", newLocale);
    }
  };

  const setAppMenu = (locale: SupportedLocale) => {
    const menu = createApplicationMenu(locale, (selected) => {
      void handleLocaleChange(selected);
    });
    Menu.setApplicationMenu(menu);
  };

  setAppMenu(currentLocale);
  createWindow();

  ipcMain.handle("get-locale", (): SupportedLocale => {
    return currentLocale;
  });

  ipcMain.handle("set-locale", async (_event: unknown, rawLocale: unknown): Promise<void> => {
    const parsed = SupportedLocaleSchema.safeParse(rawLocale);
    if (parsed.success) {
      await handleLocaleChange(parsed.data);
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on("window-all-closed", () => {
    app.quit();
  });
}

ipcMain.handle("doh", fetchHost);
ipcMain.handle("dns", resolveHost);

void bootstrap();
