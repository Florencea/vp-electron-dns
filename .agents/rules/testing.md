---
trigger: glob
globs: "test/**, **/*.test.ts, **/*.test.tsx"
description: Dual-track testing architecture and Vitest standards across Chromium browser and Node environments.
---

# Testing Standards & Guidelines

Standards for unit, component, and integration testing across this codebase.

## 1. Dual-Track Testing Architecture

Tests are split into two Vitest workspace projects configured directly in `vite.config.ts`:

- **Renderer Project (`test/renderer/**`)**:
  - Runs in headless Chromium via native `vite-plus/test/browser` and Playwright.
  - Mounts components via `renderApp()` wrapped in `<QueryClientProvider>` with mock `window.api`.
  - Dual UI assertion requirement:
    - DOM presence: `await expect.element(el).toBeInTheDocument()`
    - Visibility: `await expect.element(el).toBeVisible()`
- **Main Project (`test/main/**`)**:
  - Runs in native Node.js runtime.
  - Tests DNS/DoH resolution algorithms, system menus, and settings persistence.

## 2. Invariants & Canary Type Contracts

- **Type Contract Tests**: `test/canary/e2e-type-contract.test.ts` asserts static contract fidelity using `expectTypeOf`. Any change to shared types, servers, or locales must update and pass these assertions.
- **Automated Verification**: Use `vpr agent:test:unit` to execute test suites under TAP reporting.
