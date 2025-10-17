# Repository Guidelines

## Project Structure & Module Organization
- Source lives in `ui_files/src`; feature screens such as `Dashboard`, `ProjectCreationFlow`, and `ProjectWorkspace` reside in `components`.
- Shared primitives under `components/ui` mirror shadcn/ui and already bundle typography, layout, and form controls—reuse them before creating new atoms.
- Theme tokens and responsive breakpoints live in `styles/globals.css`; extend those variables instead of hardcoding colors or spacing.

## Build, Test, and Development Commands
- `npm install` (run inside `ui_files/`) installs the Vite + React toolchain and UI dependencies.
- `npm run dev` boots the Vite dev server with hot reload; append `-- --host` when you need LAN access from another device.
- `npm run build` compiles a production bundle under `ui_files/dist`; share this output when handing off static assets.

## Coding Style & Naming Conventions
- Favor TypeScript function components with 2-space indentation, single quotes, and `const` declarations—mirror `App.tsx` for structure.
- Compose class names with Tailwind-style utilities; use `clsx` or the `cn` helper in `components/ui/utils.ts` for conditional styling.
- Keep directories flat: feature shells stay in `components`, reusable helpers in camelCase files, and styling tokens consolidated in `styles/globals.css`.

## Testing Guidelines
- No automated suite yet—document manual verification steps in PRs and list key scenarios you exercised (creation flow, workspace navigation, role modal).
- If you add Vitest, Playwright, or similar, store specs under `src/__tests__/` or `tests/` and update this file with the command to run them.
- Name fixtures with `.mock.ts` or `.fixture.json` to surface intent during reviews.

## Commit & Pull Request Guidelines
- Use concise, imperative commit subjects (e.g., `Add workspace empty state`) and squash incidental WIP commits before pushing.
- Restrict each PR to one functional change, link any tracking tickets, and attach screenshots or GIFs for visible UI adjustments.
- Include `Testing` and `Risk` sections in the PR description so reviewers understand coverage and potential edge cases.

## Design System & Assets
- Honor the semantic color variables defined in `globals.css`; update both light-mode and `.dark` variants when expanding the palette.
- Extend existing shadcn-based primitives instead of authoring bespoke UI; new atoms belong in `components/ui/` with the same props and default states.
