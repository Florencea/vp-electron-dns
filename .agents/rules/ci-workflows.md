---
trigger: glob
globs: ".github/workflows/**"
description: CI workflow architecture, GitHub Actions major versioning policy, and actionlint shift-left verification.
---

# CI & GitHub Actions Workflow Standards

Standards for maintaining and optimizing GitHub Actions workflows across the repository.

## 1. Action Versioning Policy (Major Tags Only)

- **Floating Major Version Tags**: Always reference GitHub Actions using their latest floating major version tag (e.g., `uses: voidzero-dev/setup-vp@v1`, `uses: actions/checkout@v7`, `uses: actions/cache@v6`, `uses: actions/upload-artifact@v7`).
- **No Minor/Patch Version Pinning**: Do NOT lock exact patch or minor versions (e.g., avoid `voidzero-dev/setup-vp@v1.21.2` or `actions/checkout@v7.0.1`), allowing workflows to automatically inherit non-breaking bug fixes, performance enhancements, and runner compatibility updates without manual maintenance.
- **Verification Gate**: Whenever adding new actions or upgrading existing ones, verify that the major tag exists and is actively supported upstream.

## 2. Shift-Left Local Verification (`actionlint`)

- **Pre-Commit / Pre-Stage Validation**: Whenever `.github/workflows/` files are created or modified, run `actionlint` locally before staging (`git add`).
- **Zero Errors / Zero Warnings**: The check must pass cleanly with 0 errors and 0 warnings via:
  ```bash
  vpr agent:lint:ci
  ```
- **Offline Invariant**: `actionlint` is strictly a local shift-left guardrail. Never embed `actionlint` jobs or steps into remote GitHub Actions workflow files (`.github/workflows/*.yml`).

## 3. Workflow Invariants & Caching Architecture

- **Vite+ Action Configuration**: Use `voidzero-dev/setup-vp@v1` with `node-version-file: package.json`, `run-install: false`, and `cache: true` for deterministic runtime resolution and sub-second dependency restoration.
- **Task Runner Caching**: Preserve `node_modules/.vite/task-cache` across runs to allow unchanged tasks (linting, tests, builds) to replay in milliseconds.
- **Playwright Browser Caching**: Cache `${{ env.PLAYWRIGHT_BROWSERS_PATH }}` using the Playwright version output as key to eliminate redundant Chromium downloads across test runs.
