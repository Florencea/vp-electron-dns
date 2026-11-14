---
trigger: glob
globs: ".github/workflows/**"
description: CI workflow architecture, GitHub Actions major versioning policy, and actionlint shift-left verification.
---

# CI & GitHub Actions Workflow Standards

Standards for maintaining and optimizing GitHub Actions workflows across the repository.

## 1. Action Versioning Policy (Exact SemVer Pinning)

- **Exact SemVer Tags**: Always pin GitHub Actions and reusable workflows to exact stable SemVer tags (e.g., `uses: Florencea/vp-actions/.github/workflows/vp-electron-ci.yml@v3.0.0`, `uses: actions/checkout@v7.0.1`, `uses: actions/upload-artifact@v7.0.2`), avoiding unpinned floating tags.
- **Verification Gate**: Whenever adding new actions or upgrading existing ones, verify that the target tag exists upstream and run `vpr agent:lint:ci`.

## 2. Shift-Left Local Verification (`actionlint`)

- **Pre-Commit / Pre-Stage Validation**: Whenever `.github/workflows/` files are created or modified, run `actionlint` locally before staging (`git add`).
- **Zero Errors / Zero Warnings**: The check must pass cleanly with 0 errors and 0 warnings via:
  ```bash
  vpr agent:lint:ci
  ```
- **Offline Invariant**: `actionlint` is strictly a local shift-left guardrail. Never embed `actionlint` jobs or steps into remote GitHub Actions workflow files (`.github/workflows/*.yml`).

## 3. Centralized Electron CI (`Florencea/vp-actions`)

- **Centralized Pipeline**: Consume the shared Electron Reusable Workflow from `Florencea/vp-actions/.github/workflows/vp-electron-ci.yml@v3.0.0`, which encapsulates Linux `gatekeeper` (`agent:verify:inner`, `check:deadcode`, `agent:test:unit`, `build:all`, `app:pack`, `xvfb-run` E2E, `app:linux`) and the `platform-package` matrix (`macos-26` `app:mac`, `windows-2025` `app:win`).
- **Specialized Composite Actions**: When custom workflow steps outside `vp-electron-ci.yml` are required, use `Florencea/vp-actions/actions/setup-vp-env@v3.0.0` and `Florencea/vp-actions/actions/setup-playwright@v3.0.0`.
