# TableServe 🍽️

A modern, QR-based restaurant ordering and billing system designed for high-volume dining environments. 

[![Deployment Status](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel)](https://vercel.com/)
[![Database](https://img.shields.io/badge/Database-Supabase-green?logo=supabase)](https://supabase.com/)

## 🚀 Live Demo
- **Deployed Application:** [Insert Vercel URL Here]
- *[Add demo GIF here]*

## 📖 Overview
TableServe bridges the gap between dine-in customers and kitchen staff by offering a completely digital ordering experience. Customers scan a table-specific QR code to access a live menu and place orders, which instantly appear on the staff dashboard. 

The architecture leverages **Next.js** for SSR and Serverless API routes, **Prisma ORM** for type-safe database interactions, and **Supabase (PostgreSQL)** for reliable, managed data persistence. Real-time order synchronization is handled via **Pusher**, ensuring the kitchen never misses a ticket.

## 🛠 Tech Stack
| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui |
| **Backend** | Next.js Serverless Functions, Node.js |
| **Database** | Supabase (PostgreSQL), Prisma ORM |
| **Real-time** | Pusher Channels |
| **Auth** | NextAuth.js (Credentials Provider) |
| **Deployment**| Vercel |

## 🏗 Architecture
The application flow is designed for zero-latency updates:
1. **QR Scan (Client):** Customer scans a unique QR token linked to a `Table`.
2. **Session Initialization (API):** The server verifies the token and initializes a `TableSession`.
3. **Ordering (API → DB):** Order requests hit Next.js Serverless functions which execute atomic Prisma transactions against Supabase.
4. **Real-time Dispatch (API → Pusher):** Upon a successful DB commit, the API pushes an event via Pusher.
5. **Kitchen View (Client):** The Staff Dashboard listens to Pusher channels and updates the UI instantly without polling.

## ✨ Features
- **Dynamic QR Code Generation:** Secure, token-based QR codes tied to specific tables.
- **Real-Time Kitchen Dashboard:** WebSocket-powered Kanban-style order management (Placed → Preparing → Ready → Served).
- **Atomic Inventory Management:** Real-time stock deduction with auto-disable for sold-out items.
- **Role-Based Access Control (RBAC):** Distinct `ADMIN` and `STAFF` roles with JWT-based session verification.
- **Consolidated Billing:** Automatic aggregation of orders per table session, complete with tax calculations.

## 🛡 Edge Cases & Error Handling
We engineered TableServe to handle the chaos of a real restaurant environment:

- **Concurrency & Race Conditions:** If two customers at the same table try to order the last burger simultaneously, the API uses an atomic Prisma transaction (`stockQty: { gte: reqItem.quantity }`). The losing request gracefully fails with a `400` error ("Not enough stock") instead of overselling.
- **Stock Depletion:** When an item's inventory reaches exactly `0` during a transaction, the system automatically toggles `isAvailable = false`, instantly removing it from the customer-facing menu.
- **Session Integrity:** Attempting to place an order with a closed or invalid session ID immediately rejects the payload, preventing ghost orders after a table has paid.
- **Network Resiliency:** Database connections utilize Supabase's transaction pooler (PgBouncer) on port `6543` to prevent connection exhaustion during traffic spikes, specifically configured with `?pgbouncer=true` to bypass prepared statement limitations.
- **Invalid Auth:** Unauthenticated attempts to access `/admin` or `/dashboard` are intercepted by Next.js middleware and smoothly redirected to `/api/auth/signin`.

## 💻 Getting Started (Local Setup)

### Prerequisites
- Node.js 18+
- A Supabase Project (PostgreSQL)
- A Pusher Account

### Installation
1. **Clone the repo**
   ```bash
   git clone https://github.com/Shrey170/qr.git
   cd qr
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory and configure the following variables (see *Environment Variables* section below).

3. **Database Setup**
   Push the schema to your Supabase instance and seed the initial data:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

## 🔐 Environment Variables
| Variable | Description | Required |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase connection string (use port 6543 pooler with `?pgbouncer=true` for Vercel) | Yes |
| `DIRECT_URL` | Supabase direct connection string (port 5432) for Prisma migrations | Yes |
| `NEXTAUTH_SECRET` | Secret key for JWT encryption | Yes |
| `NEXTAUTH_URL` | Base URL of the application | Optional (Vercel auto-detects) |
| `PUSHER_APP_ID` | Pusher App ID | Yes |
| `PUSHER_KEY` / `SECRET` | Pusher credentials | Yes |
| `NEXT_PUBLIC_PUSHER_KEY` | Public-facing Pusher Key | Yes |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher Cluster region | Yes |

## ⚠️ Known Limitations & Future Improvements
- **Payment Gateway Integration:** The `Bill` schema supports payment tracking (`paymentId`, `rawWebhookPayload`), but full Stripe/Razorpay webhook integration is currently mocked.
- **IPv4 Build Limitations:** Vercel build environments lack IPv6 support, requiring `prisma migrate deploy` to be bypassed in the build script for Supabase free-tier databases. Database migrations must be run from an IPv6-capable environment (like a local machine).
- **Single Restaurant Architecture:** The current schema assumes a single-tenant environment. Multi-tenant (SaaS) support requires adding a `Restaurant` model and cascading relations.

## 📄 License
No license specified.
