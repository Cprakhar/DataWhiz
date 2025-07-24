# Copilot Instructions for datawhiz

## Project Overview

This repository is a monorepo with two main components:

- **backend/**: Go-based API server, organized with standard Go project structure.
- **frontend/**: Next.js (React/TypeScript) web application.

---

## Architecture

### Backend (Go)
- Entry point: `backend/cmd/datawhiz/server.go`
- Business logic: `backend/internal/handlers/`
- API definitions: `backend/api/`
- Shared code: `backend/pkg/`
- Dependencies managed via Go modules (`go.mod`).
- Uses `gin-gonic` for HTTP server and routing (see `go.mod`).

**Build/Run Example:**
```bash
cd backend/cmd/datawhiz
go run server.go
```

### Frontend (Next.js)
- Source code: `frontend/src/app/`
- Static assets: `frontend/public/`
- Configuration: `frontend/tsconfig.json`, `frontend/next.config.ts`
- Uses Tailwind CSS via PostCSS (`frontend/postcss.config.mjs`).

**Dev Workflow:**
```bash
cd frontend
npm run dev
```
Other scripts: `build`, `start`, `lint` (see `package.json`).

---

## Conventions & Patterns

- **Backend**: Follows idiomatic Go project layout. Place new handlers in `internal/handlers/`. Use dependency injection for shared services.
- **Frontend**: Use absolute imports with `@/` alias (see `tsconfig.json`). Organize pages/components under `src/app/`.
- **Linting**: Frontend uses ESLint with Next.js and TypeScript rules (`eslint.config.mjs`).
- **Styling**: Tailwind CSS is configured via PostCSS.

### Naming Conventions
- **Go (backend):**
  - Package names: all lowercase, no underscores (e.g., `handlers`, `pkg`).
  - Filenames: all lowercase, words separated by underscores (e.g., `server.go`).
  - Exported types/functions: `CamelCase` (e.g., `MyHandler`).
  - Unexported: `camelCase` (e.g., `myHandler`).
- **TypeScript/JS (frontend):**
  - Filenames: `camelCase` or `PascalCase` for components (e.g., `MyComponent.tsx`).
  - Variables/functions: `camelCase`.
  - Types/interfaces: `PascalCase`.
  - CSS classes (Tailwind): `kebab-case`.

---

## Integration

- The frontend communicates with the backend via HTTP API (API endpoints to be defined in backend).
- No monorepo tooling (e.g., Turborepo) detected; manage each app separately.

---

## Examples

- To add a new API route, create a handler in `backend/internal/handlers/` and register it in the main server.
- To add a new page, create a file in `frontend/src/app/`.

---

## References

- [Next.js Docs](https://nextjs.org/docs)
- [gin-gonic Docs](https://gin-gonic.com/docs/)

---

Keep instructions concise and up-to-date with actual project structure. If in doubt, check the relevant directory for examples.