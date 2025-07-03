# DataWhiz

A unified database management interface with natural language (LLM) support.

## Monorepo Structure

```
/DataWhiz
  /backend    # Go (Gin) backend, JWT & OAuth, DB connectors, LLM integration
  /frontend   # Next.js/React frontend (modern UI, auth, dashboard)
  /docs       # Technical and API documentation
  README.md
  .gitignore
  ...
```


## Features

- **User Authentication**
  - Secure registration, login, and logout with JWT (httpOnly cookies)
  - OAuth login with Google/GitHub
  - User context and session management (frontend & backend)

- **Database Connections**
  - Add new database connections (PostgreSQL, MongoDB, MySQL, SQLite)
  - Test connection before saving (no DB entry created on test)
  - Prevent duplicate connections (backend-enforced)
  - Delete (remove) saved connections
  - View connection status (isConnected, lastConnected, etc.)

- Natural language query assistant (Gemini LLM-powered)
- Query history, saved queries, and user profiles (avatar, name)
- Schema introspection and ERD
- Extensible, modern UI (Next.js, Tailwind, shadcn/ui)
- Caching, connection pooling, and rate limiting for performance
- Structured logging and error handling

## Getting Started

### Backend
1. Copy `.env.example` to `.env` and fill in secrets for Google/GitHub OAuth, JWT, Gemini, and session.
2. Install Go dependencies:
   ```bash
   cd backend
   go mod tidy
   ```
3. Run the backend server:
   ```bash
   go run ./cmd/server.go
   ```
4. See [backend/docs/api.md](backend/docs/api.md) for API documentation and usage examples.

### Frontend
1. Copy `.env.example` to `.env` in `/frontend` and fill in any required variables.
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Run the frontend dev server:
   ```bash
   npm run dev
   ```
4. The app will be available at [http://localhost:3000](http://localhost:3000)

## Documentation
- [API Reference](backend/docs/api.md)
- [Backend Tech Spec](docs/backend-tech-spec.md)
- [Frontend Tech Spec](docs/frontend-tech-spec.md)

## Contributing
- PRs and issues welcome!
- See `/docs` for tech specs and API details.

## License
MIT
