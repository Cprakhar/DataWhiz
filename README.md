# DataWhiz

A unified database management interface with natural language (LLM) support.

## Monorepo Structure

```
/DataWhiz
  /backend    # Go (Gin) backend, JWT & OAuth, DB connectors, LLM integration
  /frontend   # (Coming soon) Next.js/React frontend
  /docs       # Technical and API documentation
  README.md
  .gitignore
  ...
```

## Features
- Connect and manage multiple databases (PostgreSQL, MongoDB, etc.)
- Natural language query assistant (LLM-powered)
- Secure authentication (JWT, OAuth)
- Query history, saved queries, and user profiles
- Extensible, modern UI (frontend coming soon)

## Getting Started

### Backend
1. Copy `.env.example` to `.env` and fill in secrets for Google/GitHub OAuth, JWT, and session.
2. Install Go dependencies:
   ```bash
   cd backend
   go mod tidy
   ```
3. Run the backend server:
   ```bash
   go run ./cmd/server.go
   ```

### Frontend
- (To be added)

## Contributing
- PRs and issues welcome!
- See `/docs` for tech specs and API details.

## License
MIT
