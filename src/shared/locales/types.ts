import { z } from "zod";

export const SupportedLocaleSchema = z.enum(["zh-TW", "en-US"]);
export type SupportedLocale = z.infer<typeof SupportedLocaleSchema>;

export interface TranslationDictionary {
  menu: {
    app: {
      about: string;
      hide: string;
      hideOthers: string;
      unhide: string;
      quit: string;
    };
    file: {
      label: string;
      close: string;
      quit: string;
    };
    edit: {
      label: string;
      undo: string;
      redo: string;
      cut: string;
      copy: string;
      paste: string;
      selectAll: string;
    };
    view: {
      label: string;
      reload: string;
      forceReload: string;
      toggleDevTools: string;
      resetZoom: string;
      zoomIn: string;
      zoomOut: string;
    };
    language: {
      label: string;
      zhTW: string;
      enUS: string;
    };
    window: {
      label: string;
      minimize: string;
      zoom: string;
      front: string;
      close: string;
    };
  };
  ui: {
    title: string;
    languageLabel: string;
    queryMode: string;
    dnsMode: string;
    dohMode: string;
    domainLabel: string;
    domainPlaceholder: string;
    domainInvalid: string;
    submitBtn: string;
    resetBtn: string;
    documentLink: string;
    dnsLabel: string;
    dohLabel: string;
  };
}
