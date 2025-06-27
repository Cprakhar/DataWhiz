# DataWhiz API Documentation

## Authentication

### Register
- **POST** `/auth/register`
- **Body:** `{ "email": "user@example.com", "password": "yourpassword" }`
- **Response:** `201 Created` or error

### Login
- **POST** `/auth/login`
- **Body:** `{ "email": "user@example.com", "password": "yourpassword" }`
- **Response:** `{ "token": "JWT", "user_id": 1 }`

### Refresh Token
- **POST** `/auth/refresh`
- **Body:** `{ "token": "JWT" }`
- **Response:** `{ "token": "newJWT" }`

---

## Database Connection Management (JWT required)

### Add Connection
- **POST** `/api/db/connect`
- **Body:** `{ "db_type": "postgres", "conn_string": "postgres://..." }`
- **Response:** `{ "connection_id": 1 }`

### List Connections
- **GET** `/api/db/list`
- **Response:** `[ { "id": 1, "db_type": "postgres", ... } ]`

### Remove Connection
- **DELETE** `/api/db/disconnect/:connection_id`
- **Response:** `{ "message": "Connection deleted" }`

### Schema Introspection
- **GET** `/api/db/schema/:connection_id`
- **Response:** `{ "tables": [ { "name": "users", "columns": ["id", ...] } ] }`

---

## Query Execution (JWT required)

### Execute Query
- **POST** `/api/query/execute`
- **Body:** `{ "connection_id": 1, "query": "SELECT * FROM users;" }`
- **Response:** `{ "result": [ { "id": 1, ... } ] }`

### LLM Query Generation
- **POST** `/api/query/generate`
- **Body:** `{ "connection_id": 1, "prompt": "Show all users" }`
- **Response:** `{ "llm_query": "SELECT * FROM users;", "result": [ ... ] }`

---

## Query History (JWT required)

### Get History
- **GET** `/api/history/:user_id`
- **Response:** `[ { "prompt": "Show all users", "generated_query": "SELECT ...", ... } ]`

---

## OAuth

### Google/GitHub Login
- **GET** `/auth/google` or `/auth/github`
- **Callback:** `/auth/google/callback` or `/auth/github/callback`

---

## Example Usage (curl)

```
curl -X POST http://localhost:8080/auth/register -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"yourpassword"}'

curl -X POST http://localhost:8080/auth/login -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"yourpassword"}'

curl -X POST http://localhost:8080/api/db/connect -H 'Authorization: Bearer <JWT>' -H 'Content-Type: application/json' -d '{"db_type":"postgres","conn_string":"postgres://..."}'

curl -X POST http://localhost:8080/api/query/generate -H 'Authorization: Bearer <JWT>' -H 'Content-Type: application/json' -d '{"connection_id":1,"prompt":"Show all users"}'
```

---

For more details, see the backend tech spec or contact the maintainers.
