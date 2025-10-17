# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Teami is an AI team collaboration platform with a primary desktop application:
- **Desktop version** (`desktop-app/`): The main Electron application with local data persistence
- **UI reference** (`ui_files/`): Temporary reference UI code - **DO NOT MODIFY** files in this directory

**IMPORTANT**: The `ui_files/` directory contains only temporary reference code for UI design. All development work should be done in the `desktop-app/` directory.

## Development Commands

### Desktop Version (desktop-app/)
```bash
cd desktop-app
npm install          # Install dependencies including Electron
npm run dev          # Start concurrent Vite + Electron development
npm run build        # Build renderer process only
npm run package:mac  # Build and package macOS .dmg installer
npm run dist         # Build and package for all configured platforms
```

Note: Desktop packaging requires Xcode Command Line Tools on macOS.

## Architecture

### UI Components (desktop-app/src/)
The desktop application uses React components with:
- **Feature components**: Dashboard, ProjectCreationFlow, ProjectWorkspace, AIRolesConfig, etc. in `src/components/`
- **UI primitives**: Radix UI-based components in `src/components/ui/` following shadcn/ui patterns
- **AI/Model services**: Model calling and AI-related functionality in `src/agents/`
- **Styling**: Tailwind CSS with semantic color variables in `src/styles/globals.css`
- **Icons**: Lucide React for consistent iconography

### Desktop-Specific Features
- **Data persistence**: SQLite database via `better-sqlite3` for workspace data
- **Native APIs**: Exposed through `electron/preload.js` for secure renderer-main communication
- **Window management**: Custom title bar and native menu integration

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Build tool**: Vite 6.3.5 with SWC for fast compilation
- **UI library**: Radix UI primitives + custom styled components
- **Desktop runtime**: Electron 30.0.0
- **Database** (desktop only): better-sqlite3 for local storage

## Code Conventions

### Component Structure
- Use TypeScript function components with 2-space indentation
- Prefer `const` declarations and single quotes
- Follow the patterns established in existing components like `App.tsx`
- Keep feature components flat in `src/components/`
- Place reusable UI primitives in `src/components/ui/`

### Styling Approach
- Use Tailwind utility classes for styling
- Leverage the `cn` helper from `src/components/ui/utils.ts` for conditional classes
- Extend semantic color variables in `globals.css` rather than hardcoding colors
- Maintain both light and dark theme variants when adding new colors

### Import Aliases
The desktop application uses `@/` as an alias for the `desktop-app/src/` directory.

## Key Development Notes

### Testing
Currently no automated test suite is configured. Document manual verification steps in PRs and list key scenarios tested (creation flows, workspace navigation, role modals).

### Guidelines Reference
Important development guidelines are documented in:
- `AGENTS.md`: Repository-level coding standards and conventions
- `desktop-app/README.md`: Desktop-specific setup and packaging instructions

### Data Flow
The desktop application uses local SQLite for workspace persistence with a 5-workspace limit.

### Development Tips
- Desktop app automatically opens DevTools in development mode
- External links in desktop app open in system browser, not in-app
- Use existing Radix UI patterns before creating custom components
- Reference `ui_files/` for design patterns but never modify files there

## File Organization

```
teami/
├── ui_files/           # TEMPORARY REFERENCE ONLY - DO NOT MODIFY
│   └── src/           # UI reference code for design patterns
├── desktop-app/        # MAIN APPLICATION - ALL WORK HERE
│   ├── electron/       # Main process and preload scripts
│   ├── src/           # React components and application code
│   │   ├── components/ # Feature components + UI primitives
│   │   ├── agents/     # AI model calling and agent services
│   │   ├── styles/     # Global CSS and theme variables
│   │   └── main.tsx    # Application entry point
│   └── package.json   # Dependencies and build scripts
└── AGENTS.md          # Repository guidelines and conventions
```

**CRITICAL**: All development work must be done in `desktop-app/`. The `ui_files/` directory is for reference only and should never be modified.