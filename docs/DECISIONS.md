# TableServe Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-07-02 | Use Pusher for real-time | Next.js App Router API routes are serverless functions which makes WebSockets (like Socket.IO) very difficult to deploy on platforms like Vercel. Pusher provides an easy serverless-compatible API for WebSockets. |
| 2026-07-02 | Use SQLite for local development | The agent environment does not have a running Docker daemon, preventing the local instantiation of PostgreSQL via docker-compose. Using SQLite allows the autonomous build loop and tests to proceed. |
