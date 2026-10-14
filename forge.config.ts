import process from "node:process";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerZIP } from "@electron-forge/maker-zip";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

// Strip dynamic library injection variables (e.g. from Vite+ fspy task caching)
// to prevent architecture mismatch crashes (arm64 vs arm64e) when macOS system binaries
// such as /usr/sbin/bless are spawned during DMG packaging on CI runners.
delete process.env.DYLD_INSERT_LIBRARIES;
delete process.env.DYLD_LIBRARY_PATH;

const config = {
  hooks: {
    preMake: async () => {
      delete process.env.DYLD_INSERT_LIBRARIES;
      delete process.env.DYLD_LIBRARY_PATH;
    },
    prePackage: async () => {
      delete process.env.DYLD_INSERT_LIBRARIES;
      delete process.env.DYLD_LIBRARY_PATH;
    },
  },
  packagerConfig: {
    asar: true,
    prune: false,
    icon: "./build/icon",
    ignore: [/^\/(?!dist|package\.json)/],
  },
  makers: [
    new MakerZIP({}, ["darwin", "win32", "linux"]),
    new MakerDMG({ format: "ULFO" }, ["darwin"]),
  ],
  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
} satisfies ForgeConfig;

export default config;
