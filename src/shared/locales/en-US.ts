import type { TranslationDictionary } from "./types";

export const enUS = {
  menu: {
    app: {
      about: "About {appName}",
      hide: "Hide {appName}",
      hideOthers: "Hide Others",
      unhide: "Show All",
      quit: "Quit {appName}",
    },
    file: {
      label: "File",
      close: "Close Window",
      quit: "Quit {appName}",
    },
    edit: {
      label: "Edit",
      undo: "Undo",
      redo: "Redo",
      cut: "Cut",
      copy: "Copy",
      paste: "Paste",
      selectAll: "Select All",
    },
    view: {
      label: "View",
      reload: "Reload",
      forceReload: "Force Reload",
      toggleDevTools: "Developer Tools",
      resetZoom: "Actual Size",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
    },
    language: {
      label: "Language",
      zhTW: "繁體中文",
      enUS: "English",
    },
    window: {
      label: "Window",
      minimize: "Minimize",
      zoom: "Zoom",
      front: "Bring All to Front",
      close: "Close Window",
    },
  },
  ui: {
    title: "VP Electron DNS",
    languageLabel: "Select Language",
    queryMode: "Query Mode",
    dnsMode: "DNS",
    dohMode: "DNS over HTTPS",
    domainLabel: "Domain",
    domainPlaceholder: "e.g. example.com",
    domainInvalid: "Please enter a valid domain name",
    submitBtn: "Submit",
    resetBtn: "Reset",
    documentLink: "Document",
    dnsLabel: "DNS",
    dohLabel: "DNS over HTTPS",
  },
} as const satisfies TranslationDictionary;
