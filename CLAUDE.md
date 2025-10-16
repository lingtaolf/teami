# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Team Collaboration Platform - FastAPI backend with Vue.js frontend for managing AI team collaboration workspaces and projects.

## Development Commands

### Backend (Python/FastAPI)
- Start development server: `python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000`
- Install dependencies: `pip install -r requirements.txt`
- Run single test: `python -m pytest src/tests/test_projects.py::specific_test_name -v`
- Run all tests: `python -m pytest src/tests/ -v`

### Frontend (Vue.js)
- Development server: `cd web && npm run dev`
- Build production: `cd web && npm run build`
- Run tests: `cd web && npm run test`
- Lint code: `cd web && npm run lint`
- Install dependencies: `cd web && npm install`

## Architecture

### Backend Structure
- **Domain-driven modules**: `src/projects/` and `src/workspaces/` contain complete domain slices (models, repository, service, router)
- **Shared components**: `src/schemas/` for API schemas, `src/db/` for database, `src/exceptions.py` for custom errors
- **FastAPI app**: `src/main.py` with CORS, exception handlers, and router registration
- **Configuration**: `src/config.py` uses dataclass with environment variable loading via python-dotenv

### Frontend Structure
- **Main app**: `web/` is the production Vue.js frontend
- **Features**: Organized in `web/src/features/` (dashboard, projects, workspace, etc.)
- **Components**: Reusable UI components in `web/src/components/`
- **API layer**: Type-safe API clients in `web/src/api/`
- **Temporary assets**: `ui_files/` contains temporary UI styles and references (do not use for production)

### Data Flow
- SQLite database with UUID-based entities (Workspace, Project)
- Repository pattern for data access
- Service layer for business logic
- Router layer for HTTP endpoints
- Standardized API responses via `APIResponse` schema

## Key Files

- `src/main.py:23` - FastAPI app setup and middleware
- `src/config.py:52` - Settings management with caching
- `src/projects/router.py` - Project API endpoints
- `src/workspaces/router.py` - Workspace API endpoints
- `web/src/main.ts` - Vue app entry point
- `web/package.json:5-11` - Frontend build scripts

## Important Notes

- **Directory structure**: `web/` is the production frontend, `ui_files/` contains temporary UI styles and references
- **No Poetry setup**: Despite AGENTS.md mentions, use pip with requirements.txt
- **Database**: SQLite stored at `.sqlite/app.db` (configurable via DATABASE_PATH env var)
- **CORS origins**: Default to localhost:5173 for development, configurable via CORS_ORIGINS env var