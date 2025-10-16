# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds all backend Python services and libraries; keep domain slices under folders like `src/auth/`, `src/projects/`, and `src/agents/`.
- `web/` contains the Vue/TS frontend; place features in `web/src/features/` and shared pieces in `web/src/components/` or `web/src/composables/`.
- `ui_files/` is a scratch UI reference; exclude it from commits and move production assets into `web/` first.

## Build, Test, and Development Commands
- Backend: manage dependencies with Poetry; run `poetry install` at the repo root, then `poetry run uvicorn src.main:app --reload` to start APIs.
- Backend quality: `poetry run pytest` for suites and `poetry run pytest --cov=src` for coverage.
- Frontend: install packages from `web/` with `npm install`; use `npm run dev`, `npm run build`, and `npm run preview` for the lifecycle.
- Frontend quality: `npm run lint` (ESLint + Prettier), `npm run test`, and `npm run test -- --coverage`.

## Coding Style & Naming Conventions
- Backend follows PEP 8 with Black and isort; type annotate async endpoints and centralize schemas in `src/schemas/`.
- Vue/TS use 2-space indent, script setup, PascalCase components, kebab-case files, and camelCase exports.
- Ensure Prettier and ESLint (Vue + TypeScript + Vitest) run in `web/` and gate CI.

## Testing Guidelines
- Backend tests live in `src/tests/`; use pytest fixtures and respx for external stubs, keep ≥85% coverage on touched modules.
- Frontend tests sit in `web/tests/` or alongside components as `*.spec.ts`; run Vitest with Vue Testing Library and Cypress for E2E.
- Reset mocks between cases, add regressions for bug fixes, and refresh schema snapshots when backend contracts shift.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`) with ≤72-character subjects and meaningful bodies.
- Each PR must include a change summary, testing notes, linked issues, and screenshots or recordings for UI-affecting changes.
- Rebase on `master` before requesting review and squash locally so the branch history remains linear.

## Security & Configuration Tips
- Do not commit secrets or API keys; load them from `.env.local` and document required keys in pull requests.
- Review new third-party packages for license and security implications and capture approvals in the PR discussion.
