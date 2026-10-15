import { z } from "zod";
import type { SupportedLocale } from "./locales";
import { SupportedLocaleSchema } from "./locales";

export const ModeSchema = z.enum(["dns", "doh"]);
export type ModeT = z.infer<typeof ModeSchema>;

export const ServerSchema = z.object({
  title: z.string(),
  description: z.string(),
  document: z.string(),
  server: z.string(),
  ip: z.string(),
});
export type ServerT = z.infer<typeof ServerSchema>;

export const DnsQuerySchema = z.object({
  server: z.string(),
  ip: z.string(),
  name: z.string().trim().min(1),
  type: z.enum(["A", "AAAA"]),
});
export type DnsQueryT = z.infer<typeof DnsQuerySchema>;

export const DomainInputSchema = z
  .string()
  .trim()
  .min(1, "domain_required")
  .max(253, "domain_too_long")
  .regex(
    /^(localhost|[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/,
    "domain_invalid",
  );

export { SupportedLocaleSchema };
export type { SupportedLocale };

export interface WindowApi {
  servers: ServerT[];
  queryIpv4: (mode: ModeT, name: string) => Promise<string[]>;
  queryIpv6: (mode: ModeT, name: string) => Promise<string[]>;
  getLocale: () => Promise<SupportedLocale>;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  onLocaleChange: (callback: (locale: SupportedLocale) => void) => () => void;
}
