# Datawhiz

Datawhiz is a modern, fullstack data platform for connecting, exploring, and managing multiple databases from a single dashboard. It supports SQL and NoSQL (Postgres, MySQL, SQLite, MongoDB), provides a unified UI for schema/record browsing, and is designed for extensibility and developer productivity.

---

## Project Directory Structure

```
datawhiz/
├── server/                # Go (Gin) API server
│   ├── cmd/                # Entry point
│   ├── internal/           # Handlers, DB drivers, pool manager, etc.
│   ├── api/                # API definitions
│   ├── pkg/                # Shared Go code
│   └── go.mod, go.sum
├── client/               # Next.js (React/TypeScript) web app
│   ├── src/app/            # App source
│   ├── public/             # Static assets
│   ├── package.json, tsconfig.json, next.config.ts
│   └── ...
└── README.md
```

---

## Features

- Connect to multiple databases (Postgres, MySQL, SQLite, MongoDB)
- Connection pooling with auto-expiry
- Unified schema and record explorer for SQL/NoSQL
- Modern dashboard UI (Next.js, Tailwind CSS)
- User authentication (OAuth, email)
- Query history with execution time
- Toast notifications, protected routes, and more

**Coming soon in v2:**
- Full CRUD operations for all supported databases

---


## Local Development

### 1. Environment Variables
Both backend and frontend require their own `.env` files. Copy and edit the example files:

**Server:**
```bash
cd server
cp .env.example .env
# Edit server/.env as needed
```

**Client:**
```bash
cd client
cp .env.example .env
# Edit client/.env as needed
```

### 2. Run the Server (Go)
```bash
cd server/cmd/datawhiz
go run server.go
```

### 3. Run the Client (Next.js)
```bash
cd client
npm install
npm run dev
# or yarn dev / pnpm dev / bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Docker & Production Deployment

### 1. Docker Compose (Local)

You can run both backend and frontend with Docker Compose:

```bash
docker-compose up --build
```

This will build and start both services. The frontend will be available at [http://localhost:3000](http://localhost:3000) and the backend at [http://localhost:8080](http://localhost:8080).

### 2. Render.com (Cloud)

Datawhiz supports deployment on [Render](https://render.com) using the included `render.yaml`:

1. Push your repo to GitHub.
2. Connect your repo to Render and select the `render.yaml` for blueprint deploy.
3. Set environment variables for both services in the Render dashboard as needed (see `.env.example`).
4. For the frontend, set `BACKEND_BASE_URL` as an environment variable (not a build arg) for runtime API routing.

**Note:**
- The frontend Next.js app uses `process.env.BACKEND_BASE_URL` (or `NEXT_PUBLIC_BACKEND_BASE_URL` for client-side code). Set this in your Render or Docker environment.
- For production, always use secure values for secrets and API keys.

---

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [gin-gonic Documentation](https://gin-gonic.com/docs/)

---

## License

MIT
