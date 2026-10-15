import { useSyncExternalStore } from "react";
import type { SupportedLocale } from "../../shared/locales";

let currentLocale: SupportedLocale = "zh-TW";
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function initLocaleSubscription(): void {
  if (typeof window !== "undefined" && window.api?.getLocale !== undefined) {
    const fetchInitial = async (): Promise<void> => {
      const saved = await window.api.getLocale();
      if (currentLocale !== saved) {
        currentLocale = saved;
        notify();
      }
    };
    void fetchInitial();
  }

  if (typeof window !== "undefined" && window.api?.onLocaleChange !== undefined) {
    window.api.onLocaleChange((newLocale) => {
      if (currentLocale !== newLocale) {
        currentLocale = newLocale;
        notify();
      }
    });
  }
}

export function resetLocaleStore(initial: SupportedLocale = "zh-TW"): void {
  currentLocale = initial;
  notify();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): SupportedLocale {
  return currentLocale;
}

function getServerSnapshot(): SupportedLocale {
  return "zh-TW";
}

export async function changeLocale(newLocale: SupportedLocale): Promise<void> {
  if (currentLocale !== newLocale) {
    currentLocale = newLocale;
    notify();
  }
  if (typeof window !== "undefined" && window.api?.setLocale !== undefined) {
    await window.api.setLocale(newLocale);
  }
}

export function useLocale(): [SupportedLocale, (newLocale: SupportedLocale) => Promise<void>] {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [locale, changeLocale];
}
