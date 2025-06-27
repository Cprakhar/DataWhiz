# DataWhiz

A unified database management interface with natural language (LLM) support.

## Monorepo Structure

```
/DataWhiz
  /backend    # Go (Gin) backend, JWT & OAuth, DB connectors, LLM integration
  /frontend   # Next.js/React frontend (coming soon)
  /docs       # Technical and API documentation
  README.md
  .gitignore
  ...
```

## Features
- Connect and manage multiple databases (PostgreSQL, MongoDB, MySQL, SQLite, etc.)
- Natural language query assistant (Gemini LLM-powered)
- Secure authentication (JWT, OAuth with Google/GitHub)
- Query history, saved queries, and user profiles
- Schema introspection and ERD
- Extensible, modern UI (frontend coming soon)
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
- (To be added)

## Documentation
- [API Reference](backend/docs/api.md)
- [Backend Tech Spec](docs/backend-tech-spec.md)

## Contributing
- PRs and issues welcome!
- See `/docs` for tech specs and API details.

## License
MIT
