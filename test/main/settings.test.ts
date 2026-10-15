import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
  getInitialLocale,
  getSettingsPath,
  loadSettings,
  saveSettings,
} from "../../src/main/settings";

const getPathMock = vi.fn<() => string>();
const getLocaleMock = vi.fn<() => string>();

vi.mock("electron", () => {
  const electronMock = {
    app: {
      getPath: () => getPathMock(),
      getLocale: () => getLocaleMock(),
    },
  };
  return {
    ...electronMock,
    default: electronMock,
  };
});

describe("settings module", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vp-dns-settings-test-"));
    getPathMock.mockReturnValue(tempDir);
    getLocaleMock.mockReturnValue("en-US");
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  it("computes settings file path inside userData directory", () => {
    const filePath = getSettingsPath();
    expect(filePath).toBe(path.join(tempDir, "settings.json"));
  });

  it("returns empty object when settings file does not exist", async () => {
    const settings = await loadSettings();
    expect(settings).toEqual({});
  });

  it("returns empty object when settings file contains invalid JSON or schema", async () => {
    const filePath = getSettingsPath();
    await fs.writeFile(filePath, "{ invalid_json: ", "utf-8");
    const corruptedSettings = await loadSettings();
    expect(corruptedSettings).toEqual({});

    await fs.writeFile(filePath, JSON.stringify({ locale: "unsupported-LOCALE" }), "utf-8");
    const invalidSchemaSettings = await loadSettings();
    expect(invalidSchemaSettings).toEqual({});
  });

  it("saves and loads settings successfully", async () => {
    await saveSettings({ locale: "zh-TW" });
    const settings = await loadSettings();
    expect(settings).toEqual({ locale: "zh-TW" });
  });

  it("resolves initial locale from settings if persisted", async () => {
    await saveSettings({ locale: "zh-TW" });
    const initialLocale = await getInitialLocale();
    expect(initialLocale).toBe("zh-TW");
  });

  it("falls back to system locale if not persisted in settings", async () => {
    getLocaleMock.mockReturnValue("zh-HK");
    const initialLocale = await getInitialLocale();
    expect(initialLocale).toBe("zh-TW");

    getLocaleMock.mockReturnValue("ja-JP");
    const fallbackLocale = await getInitialLocale();
    expect(fallbackLocale).toBe("en-US");
  });
});
