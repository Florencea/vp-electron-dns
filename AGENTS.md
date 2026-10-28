<!--VITE PLUS START-->

## Vite+ Guidelines

This project uses Vite+ to manage development tools. Always use `vp` (or `vpr` shorthand for `vp run`) to run commands:

- `vpr <script>` (or `vp run <script>`): Run scripts from `package.json`
- `vp install`: Install dependencies
- `vp update`: Update dependencies
- `vp test`: Run Vitest tests
- `vp check`: Run linter, typecheck, format checks
- `vp fmt`: Run formatter
- `vp lint`: Run linter

<!--VITE PLUS END-->

# Agent Development Guidelines

Guidelines for AI agents and human contributors working on this repository.

## 1. Architecture Map

| Layer        | Path             | Responsibility                                                |
| :----------- | :--------------- | :------------------------------------------------------------ |
| **Main**     | `src/main/`      | Electron app lifecycle, window management, DNS & DoH engine   |
| **Preload**  | `src/preload/`   | Secure context bridge exposing typed `window.api`             |
| **Renderer** | `src/renderer/`  | React 19 UI with Adobe React Spectrum & Tailwind CSS v4       |
| **Shared**   | `src/shared/`    | Cross-process contracts (`ModeT`, `ServerT`) & DNS presets    |
| **Tests**    | `test/`          | Dual-track testing: Chromium browser (renderer) & Node (main) |
| **Tooling**  | `scripts/`       | Tailwind CSS validator, smoke tests, packaging runners        |
| **Rules**    | `.agents/rules/` | Domain-specific modular rules activated via file globbing     |

---

## 2. Core SSOT & Invariants

- **Single Source of Truth**:
  - DNS presets reside strictly in `src/shared/servers.ts`.
  - Cross-process contracts reside in `src/shared/types.ts`.
  - Styling tokens reside in `src/renderer/index.css` via Tailwind CSS v4 `@theme`.
- **Security & Context Isolation**:
  - Main process never imports browser-only APIs; preload exposes only typed methods via `contextBridge`.
  - Raw Node.js modules or raw `ipcRenderer` must never be exposed to the renderer.
- **Automatic Memoization**:
  - React Compiler via `@vitejs/plugin-react` (`compiler: true`) and `oxc-transform-react`.
  - Do not add manual `useMemo`, `useCallback`, or `React.memo` unless handling documented edge cases.
- **Domain Rules**: Path-specific rules live under `.agents/rules/` (`electron-main`, `ui-styling`, `testing`).

---

## 3. Frictionless Execution (Whitelist-First)

Prioritize `vpr agent:*` commands matching Antigravity's security whitelist:

- **Gate**: `vpr agent:verify:gate` (unit -> build:all -> app:pack -> e2e)
- **Inner Loop**: `vpr agent:verify:inner` (vp check + tailwind)
- **Unit Tests**: `vpr agent:test:unit`
- **Lint & Fix**: `vpr agent:lint:fix`, `vpr agent:lint:tailwind:fix`
- **CI Lint**: `vpr agent:lint:ci` (`actionlint` 0 errors/warnings)
- **Task Caching**: Scripts executed via `vpr` leverage Vite Task caching (`run.cache: { scripts: true }`). Unmodified steps replay in milliseconds. Use `vpr --last-details` to inspect cache hit status or `vp cache clean` / `vpr --no-cache` to force clean execution.

---

## 4. Git Workflow & Commit Restrictions

- **NEVER execute `git commit` directly**: Local environment uses 1Password SSH signing; non-interactive commit fails.
- **Protocol**: Stage changes with `git add <files>` and output `git commit -m "..."` in English for user to run locally.

---

## 5. Language & Planning Standards

- **Traditional Chinese for Plans & Responses**: All plans (`/plan`), walkthroughs, and chat responses must strictly be written in **Traditional Chinese (繁體中文)**.
- **Code Artifacts**: Source code, inline comments, commit messages, and automated tests must use concise English.
