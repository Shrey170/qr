# TableServe

TableServe is a production-grade restaurant ordering system designed for QR-based table ordering, staff management, and real-time inventory tracking.

## Features

- **Customer QR Ordering**: Customers scan a QR code at their table to view the menu, add items to a cart, and place orders. No app installation required.
- **Real-Time Staff Dashboard**: Staff can view incoming orders in real-time grouped by table and update order statuses (Placed -> Accepted -> Preparing -> Ready -> Served).
- **Inventory Management**: Atomic stock decrementing ensures items cannot be oversold, even under high concurrency.
- **Billing & Payments**: Integrated mock payment gateway (simulating Razorpay) for seamless checkout.
- **Admin Panel**: Manage menus, generate QR codes, and view daily sales dashboards.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite (via Prisma ORM)
- **Authentication**: NextAuth.js
- **State Management**: Zustand (for customer cart)
- **Styling**: Tailwind CSS & shadcn/ui
- **Real-time**: Pusher Channels (stubbed for local dev)

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd qr
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Ensure your `.env` file looks like this:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-super-secret-jwt-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize Database & Seed Data:**
   This project uses SQLite for local development. Run the following command to create the database schema and seed it with initial data (admin user, tables, menu items):
   ```bash
   npx prisma db push --accept-data-loss
   npx prisma generate
   npx prisma db seed
   ```
   *Note: Ensure you are using Prisma v5 as configured in the package.json.*

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Usage Guide

### Customer Flow
1. Navigate to a table session URL: `http://localhost:3000/t/<table-id>/<qr-token>` 
   *(You can find these URLs in the Admin Panel -> Table QR Codes).*
2. Browse the menu, add items to the cart, and place an order.
3. Track order status and pay the bill.

### Staff/Admin Flow
1. Navigate to `http://localhost:3000/api/auth/signin`
2. **Admin Login**:
   - Email: `admin@tableserve.com`
   - Password: `password123`
3. **Staff Login**:
   - Email: `staff1@tableserve.com`
   - Password: `password123`
4. Access the Staff Dashboard at `/dashboard` or Admin Panel at `/admin`.

## Concurrency Safety
TableServe handles concurrent order placements safely by utilizing atomic database decrement operations (`updateMany` with `{ stockQty: { gte: requestedQuantity } }`), ensuring items are never oversold.

## License
MIT
