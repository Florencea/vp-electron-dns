import { expectTypeOf, test } from "vite-plus/test";
import type { DnsQueryT } from "../../src/main/dns";
import type { AppConfig } from "../../src/shared/config";
import type { SupportedLocale } from "../../src/shared/locales";
import type { ModeT, ServerT, WindowApi } from "../../src/shared/types";

test("E2E Type Contract: ModeT is strictly union of 'dns' and 'doh'", () => {
  expectTypeOf<ModeT>().toEqualTypeOf<"dns" | "doh">();
});

test("E2E Type Contract: SupportedLocale is strictly union of 'zh-TW' and 'en-US'", () => {
  expectTypeOf<SupportedLocale>().toEqualTypeOf<"zh-TW" | "en-US">();
});

test("E2E Type Contract: ServerT adheres to required structural schema", () => {
  expectTypeOf<ServerT>().toEqualTypeOf<{
    title: string;
    description: string;
    document: string;
    server: string;
    ip: string;
  }>();

  expectTypeOf<ServerT>().toHaveProperty("title").toBeString();
  expectTypeOf<ServerT>().toHaveProperty("description").toBeString();
  expectTypeOf<ServerT>().toHaveProperty("document").toBeString();
  expectTypeOf<ServerT>().toHaveProperty("server").toBeString();
  expectTypeOf<ServerT>().toHaveProperty("ip").toBeString();
});

test("E2E Type Contract: DnsQueryT matches query parameters structure", () => {
  expectTypeOf<DnsQueryT>().toEqualTypeOf<{
    server: string;
    ip: string;
    name: string;
    type: "A" | "AAAA";
  }>();

  expectTypeOf<DnsQueryT>().toHaveProperty("type").toEqualTypeOf<"A" | "AAAA">();
});

test("E2E Type Contract: WindowApi contract matches preload exposition", () => {
  expectTypeOf<WindowApi["servers"]>().toEqualTypeOf<ServerT[]>();
  expectTypeOf<WindowApi["queryIpv4"]>().toEqualTypeOf<
    (mode: ModeT, name: string) => Promise<string[]>
  >();
  expectTypeOf<WindowApi["queryIpv6"]>().toEqualTypeOf<
    (mode: ModeT, name: string) => Promise<string[]>
  >();
  expectTypeOf<WindowApi["getLocale"]>().toEqualTypeOf<() => Promise<SupportedLocale>>();
  expectTypeOf<WindowApi["setLocale"]>().toEqualTypeOf<
    (locale: SupportedLocale) => Promise<void>
  >();
  expectTypeOf<WindowApi["onLocaleChange"]>().toEqualTypeOf<
    (callback: (locale: SupportedLocale) => void) => () => void
  >();
});

test("E2E Type Contract: AppConfig adheres to required structural schema", () => {
  expectTypeOf<AppConfig>().toEqualTypeOf<{
    title: string;
    appId: string;
  }>();

  expectTypeOf<AppConfig>().toHaveProperty("title").toBeString();
  expectTypeOf<AppConfig>().toHaveProperty("appId").toBeString();
});
