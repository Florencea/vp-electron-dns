---
trigger: glob
globs: "src/renderer/**"
description: UI development standards for React 19, Adobe React Spectrum, and Tailwind CSS v4.
---

# UI & Styling Standards

Guidelines for renderer UI components, state management, and styling.

## 1. Component Architecture & Spectrum Integration

- **UI Framework**: React 19 single-page application mounted at `src/renderer/main.tsx`.
- **Adobe React Spectrum & Tailwind v4**:
  - Theme context is provided via root `<Provider theme={defaultTheme} locale={locale}>`.
  - Style Spectrum components using `UNSAFE_className` paired with Tailwind CSS v4 theme tokens from `src/renderer/index.css`.
  - All text content must be derived through `getTranslations(locale)` from `src/shared/locales`.

## 2. Asynchronous IPC Data Flow

- IPC queries and mutations must flow through `@tanstack/react-query` (`useMutation` / `useQuery`) calling typed `window.api`.
- Never attempt direct Electron or Node.js IPC invocations from renderer components.
- Verification command for Tailwind class conformity: `vpr agent:lint:tailwind` (fix with `vpr agent:lint:tailwind:fix`).
