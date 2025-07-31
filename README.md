# Datawhiz Monorepo

This is a fullstack monorepo for Datawhiz, containing:

- **frontend/**: Next.js (React/TypeScript) web application
- **backend/**: Go (Gin) API server

---

## Project Structure

```
datawhiz/
├── backend/
│   ├── cmd/
│   │   └── server.go         # Backend entry point
│   ├── internal/            # Handlers, DB drivers, pool manager, etc.
│   ├── api/                 # API definitions
│   ├── pkg/                 # Shared Go code
│   └── go.mod, go.sum
├── frontend/
│   ├── src/app/             # Next.js app source
│   ├── public/              # Static assets
│   ├── package.json, tsconfig.json, next.config.ts
│   └── ...
└── README.md
```

---



## Setup Environment Variables

Both the backend and frontend require their own environment files. Copy and edit the example files in each directory:

### Backend
```bash
cd backend
cp .env.example .env
# Edit backend/.env as needed
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Edit frontend/.env as needed
```

---

## Running the Backend (Go)

```bash
cd backend/cmd/datawhiz
go run server.go
```

---

## Running the Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
# or yarn dev / pnpm dev / bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Features

- Multi-database connection management (Postgres, MySQL, SQLite, MongoDB)
- Connection pooling with auto-expiry
- User authentication (OAuth, email)
- Modern dashboard UI (Next.js, Tailwind CSS)
- Toast notifications, protected routes, and more

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [gin-gonic Documentation](https://gin-gonic.com/docs/)

---

## License

MIT
