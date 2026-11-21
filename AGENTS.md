# Agent Development Guidelines

Guidelines for AI agents and human contributors working on this repository.

This project manages dependencies with `npm` and runs the project-local Vite+ (`vp`) toolchain (`node_modules/.bin/vp`) through `npm run <script>` without relying on a global `vp` CLI or `pnpm`.

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

- **npm-Managed Project-Local `vp`**: Manage dependencies with `npm` (`npm ci`, `npm install`, `npm pkg get/set/delete/fix`) and invoke project-local `vp` through `package.json` scripts (`npm run <script>`) or `npx vp <cmd>` rather than relying on global `vp` or `pnpm`. When upgrading `vite-plus`, keep `package.json` `overrides.vite` (`npm:@voidzero-dev/vite-plus-core@<core-version>`), `overrides.vitest` (`<vitest-version>`), `devDependencies.vitest`, and `devDependencies["@vitest/browser-playwright"]` synchronized with `npx vp toolchain`.
- **Strict `.npmrc` & `allowScripts` Policy**: Keep `audit=false`, `engine-strict=true`, `fund=false`, `ignore-scripts=false`, `install-strategy=linked`, `save-exact=true`, and `strict-peer-deps=true` in `.npmrc`. Rely on npm's default-deny install-script policy governed by `package.json` `allowScripts` (permitting only `fs-xattr` and `macos-alias`), and install Playwright Chromium explicitly via `npm run test:setup`. Electron downloads its binary on demand without a postinstall hook.
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
- **Domain Rules**: Path-specific rules live under `.agents/rules/` (`ci-workflows`, `electron-main`, `ui-styling`, `testing`).
- **CI & Actions Invariants**: All GitHub Actions in `.github/workflows/ci.yml` must pin exact SemVer tags and pass `npm run agent:lint:ci`.

---

## 3. Frictionless Execution (Whitelist-First)

Prioritize `npm run agent:*` commands matching Antigravity's security whitelist:

- **Gate**: `npm run agent:verify:gate` (`unit` -> `build:all` -> `app:pack` -> `e2e`) or `npm run verify`
- **Inner Loop**: `npm run agent:verify:inner` (`vp check` + `lint:tailwind`)
- **Unit Verification**: `npm run agent:verify:unit` (`inner` -> `agent:test:unit`)
- **Unit Tests**: `npm run agent:test:unit`
- **Lint & Fix**: `npm run agent:lint:fix`, `npm run agent:lint:tailwind:fix`
- **CI Lint**: `npm run agent:lint:ci` (`actionlint` 0 errors/warnings)
- **Direct Local `vp` Shortcuts**: `npm run dev`, `npm run check`, `npm run fmt`, `npm run fmt:check`, `npm run lint`, `npm test`, `npm run build:all`, `npm run app:pack`, `npm run app:mac`, `npm run app:linux`, `npm run app:win`
- **Task Caching**: Scripts executed via `vp` leverage Vite Task caching (`run.cache: { scripts: true }`). Pass flags through npm when inspecting or bypassing cache: `npm run <script> -- --last-details` or `npx vp cache clean`.

---

## 4. Git Workflow & Commit Restrictions

- **NEVER execute `git commit` directly**: Local environment uses 1Password SSH signing; non-interactive commit fails.
- **Protocol**: Stage changes with `git add <files>` and output `git commit -m "..."` in English for user to run locally.

---

## 5. Language & Planning Standards

- **Traditional Chinese for Plans & Responses**: All plans (`/plan`), walkthroughs, and chat responses must strictly be written in **Traditional Chinese (繁體中文)**.
- **Code Artifacts**: Source code, inline comments, commit messages, and automated tests must use concise English.
