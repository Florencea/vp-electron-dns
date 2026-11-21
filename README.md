# VP Electron DNS

[![CI](https://github.com/Florencea/vp-electron-dns/actions/workflows/ci.yml/badge.svg)](https://github.com/Florencea/vp-electron-dns/actions/workflows/ci.yml)
[![Node Canary](https://github.com/Florencea/vp-electron-dns/actions/workflows/node-canary.yml/badge.svg)](https://github.com/Florencea/vp-electron-dns/actions/workflows/node-canary.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A DNS and DNS-over-HTTPS (DoH) benchmarking desktop application powered by **Electron**, **Vite+**, **React 19**, **Adobe React Spectrum**, **Tailwind CSS v4**, and **TanStack Query**.

Designed for deterministic DNS evaluation across preset and custom resolvers, featuring native multi-target builds, sub-second HMR with automated process hot-restart, and zero third-party Electron wrapper meta-frameworks.

---

## Highlights

- **Strict Quality Gate**: Unified verification gate (`npm run agent:verify:gate`) executing strict TypeScript, Oxlint, Oxfmt, Knip dead-code audit, dual-track testing, Vite+ multi-target builds, and Electron packaging validation.
- **Vite+ & Rolldown**: Built directly with project-local Vite+ (`vp`) and Rolldown for sub-second builds across main, preload, and renderer, managed via `npm` scripts without requiring a global `vp` CLI.
- **Hot-Restart & Dev Runner**: Native Vite+ dev runner (`npm run dev`) providing true process hot-restart on main process changes, window reload on preload edits, and component-level HMR for renderer.
- **Dual-Track Testing**: Component tests execute in headless Chromium browser mode via `@vitest/browser-playwright`, while main process, DNS resolver, and type contract tests run in Node.js.
- **Agent-First Workflow**: Clear architectural boundaries, strict coding rules, and TDD workflow documented in [AGENTS.md](AGENTS.md).
- **Process Isolation & Security**: Safe context bridge exposition ensuring raw Node.js internals and IPC channels remain isolated from the renderer.

---

## Tech Stack

| Layer                | Technology                                          |
| :------------------- | :-------------------------------------------------- |
| **Runtime & Shell**  | Electron (Context Isolation, Safe IPC Bridge)       |
| **Frontend UI**      | React 19, Adobe React Spectrum, Tailwind CSS v4     |
| **State & Fetching** | TanStack Query                                      |
| **Build & Dev**      | Vite+ (`vp`), Rolldown, Native Electron Dev Plugin  |
| **Testing**          | Vitest (Chromium Browser Mode + Node Backend Tests) |
| **Packaging**        | Electron Forge v8 (ASAR, Fuses, DMG, ZIP)           |
| **Code Quality**     | TypeScript (strict), Oxlint, Oxfmt, Knip            |

---

## Getting Started

### Prerequisites

- **Node.js** - The required version is specified in `package.json` under the `engines` field (`26.13.1`, enforced by `.npmrc` `engine-strict=true`).

### Setup

1. **Install dependencies:**

   ```sh
   npm ci
   ```

2. **Setup Playwright Chromium binary:**

   ```sh
   npm run test:setup
   ```

3. **Run in development mode:**

   ```sh
   npm run dev
   ```

---

## Available Scripts

### Developer Commands

| Command                  | Description                                                         |
| :----------------------- | :------------------------------------------------------------------ |
| `npm run dev`            | Start development environment with Electron runner (local `vp dev`) |
| `npm run check`          | Run format, Oxlint, and type checks together (local `vp check`)     |
| `npm run fmt`            | Format code with Oxfmt (local `vp fmt`)                             |
| `npm run fmt:check`      | Verify formatting without modifying files (local `vp fmt --check`)  |
| `npm run lint`           | Lint code with Oxlint (local `vp lint`)                             |
| `npm test`               | Run all Vitest tests (Chromium browser + Node) (local `vp test`)    |
| `npm run build:all`      | Build all targets (main, preload, renderer) with Vite+              |
| `npm run check:deadcode` | Detect dead code and unused exports with Knip                       |
| `npm run app:pack`       | Validate Electron packaging by generating unpacked directory        |
| `npm run app:mac`        | Package macOS application into `out/`                               |
| `npm run app:win`        | Package Windows application into `out/`                             |
| `npm run app:linux`      | Package Linux application into `out/`                               |
| `npm run test:setup`     | Install Playwright Chromium binary                                  |

### Agent Verification Commands

| Command                       | Description                                                                              |
| :---------------------------- | :--------------------------------------------------------------------------------------- |
| `npm run agent:lint:ci`       | Headless workflow validation with actionlint (`actionlint`)                              |
| `npm run agent:lint:tailwind` | Targeted Tailwind CSS canonical class validation                                         |
| `npm run agent:lint:fix`      | Automatically fix Oxlint, format, and Tailwind canonical issues                          |
| `npm run agent:test:unit`     | Vitest suite using flat TAP single-line reporter with colors and progress disabled       |
| `npm run agent:test:e2e`      | Packaged application smoke test execution                                                |
| `npm run agent:verify:inner`  | Fast-feedback inner loop: `vp check` + Tailwind validator                                |
| `npm run agent:verify:unit`   | Inner verification followed by unit tests                                                |
| `npm run agent:verify:gate`   | Full automated gate: Inner loop + Unit tests + Multi-target Build + App Pack + E2E smoke |

---

## CI/CD Pipeline Architecture

- **Tiered Daily CI (`.github/workflows/ci.yml`)**:
  - **Tier 1 (`gatekeeper`)**: Runs on `ubuntu-24.04` against the authoritative Node.js runtime (`package.json`). Executes `npm ci`, Playwright browser caching and `test:setup`, the full verification gate (`agent:verify:inner`, `check:deadcode`, `agent:test:unit`, `build:all`, `app:pack`), Linux distribution packaging (`app:linux`), and headless Electron E2E smoke testing (`xvfb-run --auto-servernum npm run agent:test:e2e`).
  - **Tier 2 (`platform-package`)**: Executes after `gatekeeper` succeeds across `macos-26` and `windows-2025`. Validates runtime path compatibility (`agent:test:unit`), production builds (`build:all`), and platform distribution packaging (`app:mac`, `app:win`).

---

## Guidelines

For architectural rules, security standards, and the agent-first feature development workflow, see [AGENTS.md](AGENTS.md).

---

## Note

- To run `npm run app:win` on macOS ARM (Apple Silicon), Rosetta 2 is required.

---

## License

This project is licensed under the MIT License.
