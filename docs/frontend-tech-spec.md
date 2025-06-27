## Frontend Technical Specification – DataWhiz

### Tech Stack
Layer	| Stack
-|-
Framework	| Next.js (App Router)
Styling|	Tailwind CSS
UI Library|	shadcn/ui or Radix UI
Data Fetching|	React Query or fetch()
State Management|	Context API
Icon Pack	|Lucide or Heroicons
LLM Integration	Call| backend /query/generate

### Page Layout & Navigation
```
+---------------------------------------------------+
| DataWhiz Logo        |   [User Avatar ▼]          |
+----------------------+----------------------------+
| [📊 Connections]     |  Active DB Info            |
| [🧠 LLM Assistant]   |                            |
| [💬 Query Editor]    |  → Query results here      |
| [🕘 History]         |                            |
|                     |                            |
+---------------------------------------------------+
```
### Core Pages & Components
- /login & /register
    - Username/password + OAuth
    -Uses NextAuth (JWT or OAuth provider)

- /dashboard
    - Sidebar:
        - Manage DB connections (Add, Remove, List)
        - Toggle between Mongo/Postgres/MySQL

    - Main area:
        - Tables, Schema viewer
        - Query Editor (raw SQL, or Mongo JSON)
        - Result viewer (table/grid)

- /assistant
    - Prompt input box
    - Optional schema hints dropdown
    - Call /query/generate → shows:
        - Generated query
        - Executed result
        - Copy to clipboard / Edit & re-run

- /history
    - List of user prompts, generated queries, timestamps
    - Expand to show partial query result preview
    - Re-run button

### Key Components
Component | Purpose
-|-
DBConnectForm|	Form to input DB type & URI
QueryEditor|	Monaco editor / TextArea + run btn
PromptBox|	LLM prompt input
ResultTable|	Show tabular output
SchemaViewer|	Show tables & columns from API
HistoryList|	Show past prompts
ToastAlerts|	Error/success feedback

### Bonus Features
- Dark/light toggle (via Tailwind's dark mode)
- Keyboard shortcuts (e.g., Ctrl + Enter to run query)
- Result export (CSV/JSON)

### MVP Development Order
- Login/Register (NextAuth)
- DB Connection Panel + API integration
- Query Editor + Raw Execute
- Prompt → LLM → Result
- History Page
- Polishing & theming

### Database Type-Based Theming
Suggested Color Mapping

Database Type|	Primary Color|	Tailwind Class|HEX
-|-|-|-
MongoDB|	Green|	green-600|	#10B981
PostgreSQL|	Blue|	blue-600|	#3B82F6
MySQL|	Teal|	teal-600|	#0D9488
SQLite|	Indigo|	indigo-600|	#4F46E5


<!-- Redis	Red	red-600	#EF4444
SQL Server	Rose	rose-600	#F43F5E -->