import fs from "node:fs/promises";
import path from "node:path";
import electron from "electron";
import { z } from "zod";
import type { SupportedLocale } from "../shared/locales";
import { resolveLocale, SupportedLocaleSchema } from "../shared/locales";

const { app } = electron;

const AppSettingsSchema = z.object({
  locale: SupportedLocaleSchema.optional(),
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;

export function getSettingsPath(): string {
  return path.join(app.getPath("userData"), "settings.json");
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await fs.readFile(getSettingsPath(), "utf-8");
    const parsed: unknown = JSON.parse(raw);
    const result = AppSettingsSchema.safeParse(parsed);
    return result.success ? result.data : {};
  } catch {
    return {};
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    const filePath = getSettingsPath();
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save settings:", err);
  }
}

export async function getInitialLocale(): Promise<SupportedLocale> {
  const settings = await loadSettings();
  if (settings.locale !== undefined) {
    return settings.locale;
  }
  return resolveLocale(app.getLocale());
}
