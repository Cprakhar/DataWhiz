## Backend Technical Specification – DataWhiz
### Tech Stack
| Component         | Choice (Go Ecosystem)                |
|-------------------|--------------------------------------|
| Runtime           | Go                                   |
| Web Framework     | Gin                                  |
| Database (App)    | SQLite (with GORM)                   |
| ORM               | GORM (for SQL DBs)                   |
| Mongo Driver      | Official MongoDB Go Driver           |
| LLM Integration   | Gemini (API or local)                |
| Auth              | JWT-based and OAuth (Google/GitHub)  |
| Containerization  | Docker                               |

### API Endpoints
1. Auth 
    - `POST /auth/login`: Login a user. (Sets JWT as httpOnly cookie)
    - `POST /auth/register`: Register a new user (name auto-set from email, capitalized).
    - `POST /auth/logout`: Logout user (clears JWT cookie).
    - `POST /auth/refresh`: Refresh JWT token.
    - `GET /api/me`: Get current user info (id, email, name, provider, avatar_url).
2. Database Connection Management 
    - `POST /api/db/connect`: Connect to a new database and store the connection temporarily (in-memory, encrypted at rest if persisted).
    - `GET /api/db/list`: Returns active DB connections.
    - `DELETE /api/db/disconnect/{connection_id}`: Disconnect and delete a connection.
    - `GET /api/db/schema/{connection_id}`: Get schema/tables for a connection.

3. Query Execution
    - `POST /api/query/execute`: Execute raw query on a specific DB.

4. LLM-Powered Natural Language Query
    - `POST /api/query/generate`: Generate and run SQL/Mongo query from natural language prompt. (Rate limited per user/IP)

5. Query History
    - `GET /api/history/{user_id}`: List past natural language → SQL interactions.

### Internal Database Schema (App State)
- `users`: id, email, password_hash, oauth_provider, name, avatar_url, created_at
- `connections`: id, user_id, db_type, conn_string (encrypted), created_at
- `query_history`: id, user_id, prompt, generated_query, db_type, executed_at, result_sample

### Other Considerations
1. **Security**
    - Do not store raw passwords or access tokens unencrypted.
    - Use JWT (httpOnly cookie) or OAuth2 for user authentication. No JWT in localStorage.
    - Sanitize and validate all queries to avoid SQL injection or unintended execution.
    - Log authentication and query events for audit.
    - Use SameSite and Secure cookie flags for production.

2. **Performance & Observability**
    - Pool DB connections per type.
    - Use caching for repeated prompts or schema introspection.
    - Rate limit LLM API calls to prevent abuse.
    - Add health check endpoint (`GET /health`).
    - Add structured logging and error handling.

3. **Schema Introspection Support**
For LLM accuracy, expose table structures:

`GET /api/db/schema/{connection_id}`
```json
Response:
{
  "tables": [
    {
      "name": "users",
      "columns": ["id", "name", "email", "joined_at"]
    }
  ]
}
```

4. **Session & User Profile**
    - OAuth login stores name and avatar from provider.
    - `/api/me` returns user id, email, name, provider, avatar_url for frontend display.
    - Logout clears JWT cookie and session.
