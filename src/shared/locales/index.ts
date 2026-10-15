import { enUS } from "./en-US";
import type { SupportedLocale, TranslationDictionary } from "./types";
import { zhTW } from "./zh-TW";

export * from "./types";

const TRANSLATIONS: Record<SupportedLocale, TranslationDictionary> = {
  "zh-TW": zhTW,
  "en-US": enUS,
};

export function resolveLocale(rawLocale?: string | null): SupportedLocale {
  if (rawLocale === null || rawLocale === undefined || rawLocale.length === 0) {
    return "zh-TW";
  }
  const normalized = rawLocale.toLowerCase();
  if (normalized.startsWith("zh")) {
    return "zh-TW";
  }
  return "en-US";
}

export function getTranslations(locale: SupportedLocale): TranslationDictionary {
  return TRANSLATIONS[locale] ?? zhTW;
}
