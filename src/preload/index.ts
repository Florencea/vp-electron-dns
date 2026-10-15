import electron from "electron";
import { resolveLocale, SupportedLocaleSchema } from "../shared/locales";
import type { SupportedLocale } from "../shared/locales";
import { SERVERS } from "../shared/servers";
import type { ModeT, WindowApi } from "../shared/types";

const { contextBridge, ipcRenderer } = electron;

const queryIpv4 = async (mode: ModeT, name: string): Promise<string[]> => {
  const result: unknown = await ipcRenderer.invoke(mode, "A", name, SERVERS);
  if (Array.isArray(result)) {
    return result.filter((item): item is string => typeof item === "string");
  }
  return [];
};

const queryIpv6 = async (mode: ModeT, name: string): Promise<string[]> => {
  const result: unknown = await ipcRenderer.invoke(mode, "AAAA", name, SERVERS);
  if (Array.isArray(result)) {
    return result.filter((item): item is string => typeof item === "string");
  }
  return [];
};

const getLocale = async (): Promise<SupportedLocale> => {
  const result: unknown = await ipcRenderer.invoke("get-locale");
  const parsed = SupportedLocaleSchema.safeParse(result);
  return parsed.success ? parsed.data : resolveLocale(typeof result === "string" ? result : null);
};

const setLocale = async (locale: SupportedLocale): Promise<void> => {
  const valid = SupportedLocaleSchema.safeParse(locale);
  if (valid.success) {
    await ipcRenderer.invoke("set-locale", valid.data);
  }
};

const onLocaleChange = (callback: (locale: SupportedLocale) => void): (() => void) => {
  const listener = (_event: electron.IpcRendererEvent, rawLocale: unknown) => {
    const parsed = SupportedLocaleSchema.safeParse(rawLocale);
    if (parsed.success) {
      callback(parsed.data);
    }
  };
  ipcRenderer.on("locale-changed", listener);
  return () => {
    ipcRenderer.removeListener("locale-changed", listener);
  };
};

const api: WindowApi = {
  servers: SERVERS,
  queryIpv4,
  queryIpv6,
  getLocale,
  setLocale,
  onLocaleChange,
};

try {
  contextBridge.exposeInMainWorld("api", api);
} catch (error) {
  console.error(error);
}
