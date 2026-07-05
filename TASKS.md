# TableServe Implementation Tasks

- [x] 01. Initialize Next.js project with Tailwind and TypeScript.
- [x] 02. Install Prisma, configure PostgreSQL schema (Models: Table, Session, Category, Item, Order, Bill, Payment, User).
- [x] 03. Setup base UI components (shadcn/ui or custom Tailwind components).
- [x] 04. Setup NextAuth.js for Staff/Admin authentication.
- [x] 05. Create seed script (DB reset, 1 admin, 2 staff, categories, items, tables).
- [x] 06. API: GET /api/menu (Public, returns categories and available items).
- [x] 07. API: POST /api/tables/[id]/scan (Validate QR token, create/resume TableSession).
- [x] 08. Customer UI: `app/(customer)/t/[tableId]/[qrToken]/page.tsx` - Session initialization and Menu display.
- [x] 09. State: Setup Zustand store for Cart state (persisted per session).
- [x] 10. Customer UI: Cart Drawer/Page.
- [x] 11. API: POST /api/orders (Transaction: validate stock, decrement stock, create order, create inventory log).
- [x] 12. Unit Test: Test concurrent stock decrement on POST /api/orders.
- [x] 13. Customer UI: Order Status Tracker page.
- [x] 14. Real-time Setup: Configure Pusher (Channels).
- [x] 15. Backend: Emit 'new-order' event to Pusher on successful order placement.
- [x] 16. Staff UI: Dashboard Layout and Auth guard.
- [x] 17. API: GET /api/staff/orders (Fetch active orders grouped by table).
- [x] 18. Staff UI: Real-time Order Feed (listen to Pusher 'new-order').
- [x] 19. API: PATCH /api/orders/[id]/status (Update order status).: ACCEPTED, PREPARING, READY, SERVED).
- [x] 20. Staff UI: One-tap status transition buttons for orders.
- [x] 21. Backend: Emit 'order-status-update' to notify customer UI.
- [x] 22. Customer UI: Listen to Pusher for live order status updates.
- [x] 23. API: GET /api/bills/[sessionId] (Calculate total + tax).
- [x] 24. API: POST /api/bills/[sessionId]/pay (Mock Razorpay gateway integration).
- [x] 25. Customer UI: `app/(customer)/t/[tableId]/[qrToken]/bill/page.tsx` - Bill summary & Pay button.
- [x] 26. Customer UI: View Bill page.
- [x] 27. API: POST /api/bill/[sessionId]/pay (Generate Razorpay mock QR/order).
- [x] 28. Customer UI: Payment screen (Show QR or Mock "Pay Now" button).
- [x] 29. API: POST /api/webhooks/payment (Verify payment, update Bill, close Session, Table -> AVAILABLE).
- [x] 30. Backend: Emit 'table-freed' event to Staff Dashboard.
- [x] 31. Admin UI: Layout and Role guard.
- [x] 32. Admin API & UI: Menu Categories CRUD.
- [x] 33. Admin API & UI: Menu Items CRUD & Inventory Management (Low stock alerts).
- [x] 34. Admin API & UI: Table generation (QR codes).
- [x] 35. Admin UI: Basic Sales Dashboard (Orders/Revenue today).
- [x] 36. Testing: Integration test for API routes.
- [x] 37. Testing: E2E happy path test (scan -> order -> pay).
- [x] 38. Polish: Responsive design, empty states, loading skeletons.
- [x] 39. Documentation: Write README.md (Setup, env vars, docker-compose).
- [x] 40. Final Review: Verify all acceptance criteria from DoD.

## Deployment Fix Loop — Started 2026-07-05T14:05:58+05:30

- Iteration 1: Diagnosed missing DIRECT_URL, non-URL-encoded Supabase password, and missing `prisma migrate deploy` in Vercel build script. Applied fixes. Verified locally with `npm run build` which succeeded.

## BLOCKED — Needs Human Input

- **Exact remaining error:** Cannot proceed to deploy to Vercel.
- **What was tried:** Attempted to run Vercel CLI commands (`vercel ls`, `vercel --prod`) but was prompted for authentication ("No existing credentials found. Starting login flow...").
- **What you suspect but can't confirm:** I suspect the project is successfully fixed and will deploy smoothly, but I need a `VERCEL_TOKEN` environment variable or for you to authenticate the Vercel CLI locally so that I can execute `vercel --prod` and verify the deployment.
