import type { TranslationDictionary } from "./types";

export const zhTW = {
  menu: {
    app: {
      about: "關於 {appName}",
      hide: "隱藏 {appName}",
      hideOthers: "隱藏其他",
      unhide: "全部顯示",
      quit: "結束 {appName}",
    },
    file: {
      label: "檔案",
      close: "關閉視窗",
      quit: "結束 {appName}",
    },
    edit: {
      label: "編輯",
      undo: "復原",
      redo: "取消復原",
      cut: "剪下",
      copy: "複製",
      paste: "貼上",
      selectAll: "全選",
    },
    view: {
      label: "檢視",
      reload: "重新載入",
      forceReload: "強制重新載入",
      toggleDevTools: "開發人員工具",
      resetZoom: "實際大小",
      zoomIn: "放大",
      zoomOut: "縮小",
    },
    language: {
      label: "語言",
      zhTW: "繁體中文",
      enUS: "English",
    },
    window: {
      label: "視窗",
      minimize: "最小化",
      zoom: "縮放",
      front: "全部移至最上層",
      close: "關閉視窗",
    },
  },
  ui: {
    title: "VP Electron DNS",
    languageLabel: "選擇語言",
    queryMode: "查詢模式",
    dnsMode: "DNS",
    dohMode: "DNS over HTTPS",
    domainLabel: "網域名稱",
    domainPlaceholder: "例如：example.com",
    domainInvalid: "請輸入有效的網域名稱",
    submitBtn: "查詢",
    resetBtn: "清除",
    documentLink: "說明文件",
    dnsLabel: "DNS",
    dohLabel: "DNS over HTTPS",
  },
} as const satisfies TranslationDictionary;
