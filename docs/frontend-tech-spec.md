## Frontend Technical Specification – DataWhiz

### Tech Stack
Layer | Stack
-|-
Framework | Next.js (App Router)
Styling| Tailwind CSS
UI Library| shadcn/ui, Radix UI
Data Fetching| fetch() (with credentials: "include" for auth)
State Management| Context API (UserProvider)
Icon Pack | Lucide, Heroicons
LLM Integration | Call backend /api/query/generate

### Page Layout & Navigation
```
+---------------------------------------------------+
| DataWhiz Logo        |   [User Avatar ▼]          |
+----------------------+----------------------------+
| [📊 Connections]     |  Active DB Info            |
| [🧠 LLM Assistant]   |                            |
| [💬 Query Editor]    |  → Query results here      |
| [🕘 History]         |                            |
| [🗃️ Tables/Collections] | CRUD actions (Insert, Update, Delete, Browse) |
+---------------------------------------------------+
```
### Core Pages & Components
- /login & /register & /logout
    - Username/password + OAuth (Google/GitHub)
    - Uses httpOnly JWT cookie for auth (no localStorage)
    - Redirects: logged-in users are redirected from /login or /register to /dashboard
    - Logout: POST /auth/logout, clears cookie, integrated in Topbar, resets user context
    - UserContext fetches /api/me for user info (id, email, name, avatar, provider)

- /dashboard (protected)
    - Sidebar:
        - Manage DB connections (Add, Remove, List)
        - Toggle between Mongo/Postgres/MySQL

    - Main area:
        - Tables/Collections, Schema viewer (with field/type info)
        - CRUD UI: Insert, Update, Delete, Browse (with row/document preview, bulk actions)
        - Query Editor (raw SQL, or Mongo JSON)
        - Result viewer (table/grid)
        - Save Query button

- /assistant
    - Prompt input box
    - Optional schema hints dropdown
    - Call /api/query/generate → shows:
        - Generated query
        - Executed result
        - Copy to clipboard / Edit & re-run
        - Explain Query / Refine Query options

- /history
    - List of user prompts, generated queries, timestamps
    - Expand to show partial query result preview
    - Re-run, edit, or delete saved queries

### Key Components
Component | Purpose
-|-
DBConnectForm| Form to input DB type & URI
LogoutButton| Logs out user by calling /auth/logout, resets context, and redirects to login
QueryEditor| Monaco editor / TextArea + run btn, Save Query, CRUD actions
PromptBox| LLM prompt input
ResultTable| Show tabular output
SchemaViewer| Show tables & columns/fields from API (SQL & Mongo)
HistoryList| Show past prompts/queries, allow re-run/edit/delete
ToastAlerts| Error/success feedback
UserMenu| Shows avatar, name, provider, and logout
UserProvider| Context for user info, handles /api/me fetch and auth state

### Bonus Features
- Dark/light toggle (via Tailwind's dark mode)
- Keyboard shortcuts (e.g., Ctrl + Enter to run query)
- Result export (CSV/JSON)
- Row/document preview for browse
- Bulk actions for delete
- OAuth avatar and name display in dashboard

### MVP Development Order
- Login/Register (OAuth + JWT)
- DB Connection Panel + API integration
- Query Editor + Raw Execute + CRUD UI
- Prompt → LLM → Result (with explain/refine)
- History Page (with re-run/edit/delete)
- Polishing & theming

### Database Type-Based Theming
Suggested Color Mapping

Database Type| Primary Color| Tailwind Class|HEX
-|-|-|-
MongoDB| Green| green-600| #10B981
PostgreSQL| Blue| blue-600| #3B82F6
MySQL| Teal| teal-600| #0D9488
SQLite| Indigo| indigo-600| #4F46E5

<!-- Redis	Red	red-600	#EF4444
SQL Server	Rose	rose-600	#F43F5E -->