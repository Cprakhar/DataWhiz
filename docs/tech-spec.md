## Project: DataWhiz
Building a unified database management interface with natural language (LLM) support. Here's how you can break it down:

### Key Features
1. Unified Database Dashboard
    - Connect and switch between multiple DB types (MongoDB, PostgreSQL, MySQL, SQLite, etc.).

    - View tables/collections, schemas, and run manual queries.

    - Basic CRUD operations (Insert, Update, Delete, Browse).

    - Connection info saved securely (perhaps with encryption or via environment variables).

2. LLM Query Assistant
    - Input: "Show me all users who joined in the last 7 days"

    - Converts to SQL (or Mongo query) using LLM (OpenAI, Claude, or local model).

    - Executes it and shows tabular result.

    - Provide option to copy generated query or refine it.

3. Authentication & User Profiles (Optional but good for future)
    - Local accounts or OAuth (Google/GitHub).

    - Personal saved queries / history.

4. Prompt Templates or Guided Querying
    - Dropdowns for filtering, aggregation, etc.

    - Explain this query → show plain English version of complex query.

    - Query from CSV or generate Mongo aggregation pipelines.


### Tech Stack
Layer | Options
-|-
Frontend | Next.js + Tailwind (or React)
Backend	| Golang (Gin)
DB Layer | SQLAlchemy, Prisma, or custom connectors
LLM	| Gemini (e.g., local llama3 or sqlcoder), LangChain for prompt handling
Deployment | Docker + Render.com / Railway
Auth | NextAuth

### Example LLM Prompt + Output Flow
```text
User: "Show me all orders above $500 from last month"

→ Prompt to LLM:
"You are a SQL assistant. Generate a SQL query for PostgreSQL given this request: 'Show me all orders above $500 from last month'. Table: orders(amount, order_date, ...)"

→ Output:
SELECT * FROM orders WHERE amount > 500 AND order_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
```
Then execute this query and display in table.

### Bonus Ideas
- Save past LLM queries and generated results.

- Dark/light theme switcher.

- Schema visualizer or ERD for relational DBs.

- Natural language data insertion or update ("Add a new user named John").

- Plugin system to add other data sources like REST APIs or CSV.

### MVP Plan
- Connect to PostgreSQL and MongoDB.
- Build frontend with tabs for each DB type.
- Add query editor + output panel.
- Add prompt → query generator (LLM).
- Execute and show results.