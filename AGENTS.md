# Repository Guidelines

## Project Structure & Module Organization
- **Main development**: All work happens in `desktop-app/src/` (NOT `ui_files/`)
- **Feature screens**: `Dashboard`, `ProjectCreationFlow`, `ProjectWorkspace` reside in `desktop-app/src/components/`
- **AI/Model services**: Model calling and agent-related functionality in `desktop-app/src/agents/`
- **Shared primitives**: `components/ui` mirror shadcn/ui and bundle typography, layout, form controls—reuse before creating new atoms
- **Theme tokens**: Responsive breakpoints live in `styles/globals.css`; extend variables instead of hardcoding colors or spacing
- **Reference only**: `ui_files/` contains temporary UI reference code - **DO NOT MODIFY**

## Build, Test, and Development Commands
- `npm install` (run inside `desktop-app/`) installs Electron, Vite, React toolchain and UI dependencies
- `npm run dev` boots concurrent Vite + Electron dev server with hot reload
- `npm run build` compiles production bundle under `desktop-app/dist`
- `npm run package:mac` builds and packages macOS .dmg installer

## AI/Model Services (desktop-app/src/agents/)
- **Model calling**: All AI model integration and API calls should be implemented in `src/agents/`
- **Agent services**: Business logic for AI agent interactions, prompt management, and response processing
- **Configuration**: Model endpoints, API keys, and agent configuration files
- **Types**: TypeScript interfaces for agent requests, responses, and model configurations
- **Utils**: Helper functions for prompt formatting, token counting, and response parsing

## Coding Style & Naming Conventions
- Favor TypeScript function components with 2-space indentation, single quotes, and `const` declarations—mirror `App.tsx` for structure.
- Compose class names with Tailwind-style utilities; use `clsx` or the `cn` helper in `components/ui/utils.ts` for conditional styling.
- Keep directories flat: feature shells stay in `components`, AI services in `agents/`, styling tokens in `styles/globals.css`.

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
