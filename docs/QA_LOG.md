# TableServe QA Log

## 1. Table & QR Session Scenarios
- [x] Scan a fresh table's QR -> new session created, table flips to OCCUPIED.
- [x] Scan the same table's QR from a second device -> joins the same session.
- [x] Hit an invalid/tampered QR token -> friendly error, no session created. (Returns 404 cleanly)
- [x] Hit a QR for a table that is already AWAITING_PAYMENT -> appropriate message. (Joins existing session to pay)

## 2. Menu Scenarios
- [x] Menu loads correctly grouped by category with live stock. (Verified manually via UI)
- [x] Set stockQty to 0 -> item unavailable.
- [x] Mark isAvailable = false -> item unavailable.

## 3. Cart & Ordering Scenarios
- [x] Add items, refresh mid-session -> cart persists (Zustand persist).
- [x] Place an order -> order appears correctly with line items and subtotal.
- [x] Place a second order later -> rolls up into one bill.
- [x] Concurrency test -> one succeeds, one rejected. (Atomic `updateMany` guarantees stock doesn't drop < 0).
- [x] Order out of stock item -> rejected with message.
- [x] InventoryLog row created.

## 4. Staff Dashboard Scenarios
- [x] Staff Auth Guard.
- [x] Real-time feed (Tested via Pusher server trigger).
- [x] Live transitions.
- [x] Table status board updates.
- [x] Low stock alert (Tested via Admin dashboard).

## 5. Billing Scenarios
- [x] "View Bill" shows correct itemized total (Verified subtotal + tax in `qa-56.ts`).
- [x] Bill total updates correctly after new order.

## 6. Payment Scenarios
- [x] "Pay Now" generates payment QR scoped to correct amount.
- [x] Complete payment -> Bill.status = PAID, Payment row created.
- [x] Table release: TableSession CLOSED, Table AVAILABLE, new session starts clean.
- [x] Failed payment -> Bill stays PENDING.
- [x] Staff cash override.
- [x] Attempt double pay -> safely rejected.

## 7. Admin & Cross-Cutting Scenarios
- [x] Admin CRUD.
- [x] Restock -> InventoryLog, item available again.
- [x] QR Generation.
- [x] API error handling.
- [x] No console errors.
- [x] Fresh clone boot.
