import electron, { type MenuItemConstructorOptions } from "electron";
import { APP_CONFIG } from "../shared/config";
import type { SupportedLocale } from "../shared/locales";
import { getTranslations } from "../shared/locales";

const { Menu, app } = electron;

export function createApplicationMenu(
  locale: SupportedLocale,
  onSelectLocale?: (locale: SupportedLocale) => void,
): electron.Menu {
  const isDev = !app.isPackaged;
  const isMac = process.platform === "darwin";
  const appName = APP_CONFIG.title;
  const t = getTranslations(locale);

  const aboutLabel = t.menu.app.about.replace("{appName}", appName);
  const hideLabel = t.menu.app.hide.replace("{appName}", appName);
  const quitLabel = t.menu.app.quit.replace("{appName}", appName);

  const languageSubmenu: MenuItemConstructorOptions = {
    label: t.menu.language.label,
    submenu: [
      {
        label: t.menu.language.zhTW,
        type: "radio",
        checked: locale === "zh-TW",
        click: () => {
          onSelectLocale?.("zh-TW");
        },
      },
      {
        label: t.menu.language.enUS,
        type: "radio",
        checked: locale === "en-US",
        click: () => {
          onSelectLocale?.("en-US");
        },
      },
    ],
  };

  const menuMac: MenuItemConstructorOptions[] = [
    {
      role: "appMenu",
      label: appName,
      submenu: [
        { role: "about", label: aboutLabel },
        { type: "separator" },
        { role: "hide", label: hideLabel },
        { role: "hideOthers", label: t.menu.app.hideOthers },
        { role: "unhide", label: t.menu.app.unhide },
        { type: "separator" },
        { role: "quit", label: quitLabel },
      ],
    },
    {
      role: "fileMenu",
      label: t.menu.file.label,
      submenu: [{ role: "close", label: t.menu.file.close }],
    },
    {
      role: "editMenu",
      label: t.menu.edit.label,
      submenu: [
        { role: "undo", label: t.menu.edit.undo },
        { role: "redo", label: t.menu.edit.redo },
        { type: "separator" },
        { role: "cut", label: t.menu.edit.cut },
        { role: "copy", label: t.menu.edit.copy },
        { role: "paste", label: t.menu.edit.paste },
        { role: "selectAll", label: t.menu.edit.selectAll },
      ],
    },
    {
      label: t.menu.view.label,
      role: "viewMenu",
      submenu: [
        { role: "reload", label: t.menu.view.reload, visible: isDev, enabled: isDev },
        {
          role: "forceReload",
          label: t.menu.view.forceReload,
          visible: isDev,
          enabled: isDev,
        },
        {
          role: "toggleDevTools",
          label: t.menu.view.toggleDevTools,
          visible: isDev,
          enabled: isDev,
        },
        { role: "resetZoom", label: t.menu.view.resetZoom },
        { role: "zoomIn", label: t.menu.view.zoomIn },
        { role: "zoomOut", label: t.menu.view.zoomOut },
      ],
    },
    languageSubmenu,
    {
      label: t.menu.window.label,
      role: "windowMenu",
      submenu: [
        { role: "minimize", label: t.menu.window.minimize },
        { role: "zoom", label: t.menu.window.zoom },
        { type: "separator" },
        { role: "front", label: t.menu.window.front },
      ],
    },
  ];

  const menuWindows: MenuItemConstructorOptions[] = [
    {
      role: "fileMenu",
      label: t.menu.file.label,
      submenu: [{ role: "quit", label: quitLabel }],
    },
    {
      role: "editMenu",
      label: t.menu.edit.label,
      submenu: [
        { role: "undo", label: t.menu.edit.undo },
        { role: "redo", label: t.menu.edit.redo },
        { type: "separator" },
        { role: "cut", label: t.menu.edit.cut },
        { role: "copy", label: t.menu.edit.copy },
        { role: "paste", label: t.menu.edit.paste },
        { role: "selectAll", label: t.menu.edit.selectAll },
      ],
    },
    {
      label: t.menu.view.label,
      role: "viewMenu",
      submenu: [
        { role: "reload", label: t.menu.view.reload, visible: isDev, enabled: isDev },
        {
          role: "forceReload",
          label: t.menu.view.forceReload,
          visible: isDev,
          enabled: isDev,
        },
        {
          role: "toggleDevTools",
          label: t.menu.view.toggleDevTools,
          visible: isDev,
          enabled: isDev,
        },
        { role: "resetZoom", label: t.menu.view.resetZoom },
        { role: "zoomIn", label: t.menu.view.zoomIn },
        { role: "zoomOut", label: t.menu.view.zoomOut },
      ],
    },
    languageSubmenu,
    {
      label: t.menu.window.label,
      role: "windowMenu",
      submenu: [
        { role: "minimize", label: t.menu.window.minimize },
        { role: "zoom", label: t.menu.window.zoom },
        { type: "separator" },
        { role: "close", label: t.menu.window.close },
      ],
    },
  ];

  return Menu.buildFromTemplate(isMac ? menuMac : menuWindows);
}
