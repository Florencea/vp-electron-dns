import type { MenuItemConstructorOptions } from "electron";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createApplicationMenu } from "../../src/main/menu";
import type { SupportedLocale } from "../../src/shared/types";

const buildFromTemplateMock = vi.fn<
  (template: MenuItemConstructorOptions[]) => { items: MenuItemConstructorOptions[] }
>((template) => ({ items: template }));

vi.mock("electron", () => {
  const electronMock = {
    app: {
      name: "vp-electron-dns",
    },
    Menu: {
      buildFromTemplate: (template: MenuItemConstructorOptions[]) =>
        buildFromTemplateMock(template),
    },
  };
  return {
    ...electronMock,
    default: electronMock,
  };
});

describe("createApplicationMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds menu template with zh-TW labels and checked status", () => {
    createApplicationMenu("zh-TW");

    expect(buildFromTemplateMock).toHaveBeenCalledOnce();
    const template = buildFromTemplateMock.mock.calls[0]?.[0] ?? [];

    const langMenu = template.find((item) => item.label === "語言");
    expect(langMenu).toBeDefined();

    const submenu = langMenu?.submenu;
    expect(Array.isArray(submenu)).toBe(true);
    if (!Array.isArray(submenu)) {
      return;
    }

    const zhItem = submenu.find((item) => item.label === "繁體中文");
    const enItem = submenu.find((item) => item.label === "English");

    expect(zhItem).toBeDefined();
    expect(zhItem?.checked).toBe(true);
    expect(enItem).toBeDefined();
    expect(enItem?.checked).toBe(false);
  });

  it("builds menu template with en-US labels and checked status", () => {
    createApplicationMenu("en-US");

    expect(buildFromTemplateMock).toHaveBeenCalledOnce();
    const template = buildFromTemplateMock.mock.calls[0]?.[0] ?? [];

    const langMenu = template.find((item) => item.label === "Language");
    expect(langMenu).toBeDefined();

    const submenu = langMenu?.submenu;
    expect(Array.isArray(submenu)).toBe(true);
    if (!Array.isArray(submenu)) {
      return;
    }

    const zhItem = submenu.find((item) => item.label === "繁體中文");
    const enItem = submenu.find((item) => item.label === "English");

    expect(zhItem).toBeDefined();
    expect(zhItem?.checked).toBe(false);
    expect(enItem).toBeDefined();
    expect(enItem?.checked).toBe(true);
  });

  it("invokes onSelectLocale when a language radio item is clicked", () => {
    const onSelectLocale = vi.fn<(loc: SupportedLocale) => void>();
    createApplicationMenu("zh-TW", onSelectLocale);

    const template = buildFromTemplateMock.mock.calls[0]?.[0] ?? [];
    const langMenu = template.find((item) => item.label === "語言");
    const submenu = langMenu?.submenu;
    if (!Array.isArray(submenu)) {
      return;
    }

    const enItem = submenu.find((item) => item.label === "English");
    expect(typeof enItem?.click).toBe("function");
    if (typeof enItem?.click === "function") {
      Reflect.apply(enItem.click, enItem, []);
    }

    expect(onSelectLocale).toHaveBeenCalledWith("en-US");
  });
});
