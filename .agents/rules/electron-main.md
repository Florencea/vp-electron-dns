---
trigger: glob
globs: "src/main/**, src/preload/**, src/shared/**"
description: Electron main process, preload security bridge, settings, and shared IPC contracts standards.
---

# Electron Main & Preload Guidelines

Standards for backend networking, window lifecycle, and secure cross-process communication.

## 1. Process Separation & Security Boundary

- **Main Process (`src/main/`)**:
  - Responsible for Electron application lifecycle, window management, system menus (`menu.ts`), and user settings persistence (`settings.ts`).
  - DNS resolution and DoH engine logic reside strictly in `dns.ts`.
  - Never import browser-only APIs into the main process.
- **Preload Bridge (`src/preload/`)**:
  - Exposes typed APIs exclusively via `contextBridge.exposeInMainWorld("api", ...)`.
  - Type definitions reside in `src/preload/index.d.ts`.
  - **Security Invariant**: Never expose raw Node.js modules or raw `ipcRenderer` directly to the renderer. Context isolation is mandatory.
- **Shared (`src/shared/`)**:
  - Cross-process contracts in `types.ts` (`ModeT`, `ServerT`, `WindowApi`).
  - SSOT for DNS presets in `servers.ts` and UI localization in `locales/`.

## 2. IPC Feature Development Flow

When adding or modifying an IPC capability:

1. **Contract**: Add request/response schemas to `src/shared/types.ts`.
2. **Main Handler**: Implement business logic in `src/main/` and register with `ipcMain.handle()`.
3. **Preload Exposure**: Expose typed method in `src/preload/index.ts` and reflect in `src/preload/index.d.ts`.
4. **Contract Verification**: Update `test/canary/e2e-type-contract.test.ts` to assert interface fidelity.
