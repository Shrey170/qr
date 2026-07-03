import prisma from '../src/lib/prisma';
import crypto from 'crypto';

async function runTest() {
  console.log("Starting Section 2 & 3 QA...");
  const baseUrl = "http://localhost:3000";

  // Create a category and item for testing
  let category = await prisma.menuCategory.findFirst();
  if (!category) {
    category = await prisma.menuCategory.create({ data: { name: "QA Category", description: "QA" } });
  }

  // Create an item with exactly 1 stock
  const item = await prisma.menuItem.create({
    data: {
      name: "QA Item " + Date.now(),
      price: 100,
      stockQty: 1,
      isAvailable: true,
      categoryId: category.id
    }
  });

  const table = await prisma.table.create({ data: { number: Math.floor(Math.random() * 1000), qrToken: crypto.randomUUID() } });
  
  // Create a session directly
  const session = await prisma.tableSession.create({ data: { tableId: table.id } });
  await prisma.table.update({ where: { id: table.id }, data: { currentSessionId: session.id, status: 'OCCUPIED' }});

  console.log(`[Test 3.1] Placed order -> appears correctly`);
  // Note: We need a valid JWT or we bypass auth for customer endpoints (which are unprotected except for sessionId in body)
  
  // Wait, let's look at `POST /api/orders`
  const orderRes = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: session.id,
      items: [{ menuItemId: item.id, quantity: 1, name: item.name, price: item.price }]
    })
  });
  
  const orderData = await orderRes.json();
  if (!orderRes.ok) throw new Error(`Failed 3.1: ${JSON.stringify(orderData)}`);
  
  const dbOrder = await prisma.order.findUnique({ where: { id: orderData.orderId }, include: { items: true } });
  if (!dbOrder || dbOrder.items.length !== 1 || dbOrder.items[0].subtotal !== 100) {
    console.log("DB Order:", dbOrder);
    throw new Error(`Failed 3.1: Order mismatch in DB`);
  }
  console.log(`✅ Passed 3.1 (Order placed)`);

  console.log(`[Test 3.5] InventoryLog row created`);
  const logs = await prisma.inventoryLog.findMany({ where: { menuItemId: item.id } });
  if (logs.length === 0 || logs[0].changeQty !== -1) {
    throw new Error(`Failed 3.5: InventoryLog missing or incorrect: ${JSON.stringify(logs)}`);
  }
  console.log(`✅ Passed 3.5`);

  console.log(`[Test 3.4] Order out of stock item -> rejected`);
  const orderRes2 = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: session.id,
      items: [{ menuItemId: item.id, quantity: 1, name: item.name, price: item.price }]
    })
  });
  if (orderRes2.ok) {
    throw new Error(`Failed 3.4: Order should have been rejected but got ${orderRes2.status}`);
  }
  console.log(`✅ Passed 3.4 (Out of stock rejected)`);

  console.log(`[Test 3.3] Concurrency test (simulate simultaneous requests)`);
  
  // Create another item with exactly 1 stock
  const concItem = await prisma.menuItem.create({
    data: { name: "Conc Item", price: 50, stockQty: 1, isAvailable: true, categoryId: category.id }
  });

  const p1 = fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: session.id,
      items: [{ menuItemId: concItem.id, quantity: 1, name: concItem.name, price: concItem.price }]
    })
  });

  const p2 = fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: session.id,
      items: [{ menuItemId: concItem.id, quantity: 1, name: concItem.name, price: concItem.price }]
    })
  });

  const [r1, r2] = await Promise.all([p1, p2]);
  const statuses = [r1.ok, r2.ok];
  
  if (statuses.filter(Boolean).length !== 1) {
    throw new Error(`Failed 3.3: Concurrency issue. Both or neither succeeded. Statuses: ${r1.status}, ${r2.status}`);
  }
  
  const finalConcItem = await prisma.menuItem.findUnique({ where: { id: concItem.id } });
  if (finalConcItem?.stockQty !== 0) {
    throw new Error(`Failed 3.3: Stock quantity went to ${finalConcItem?.stockQty}, expected 0`);
  }
  console.log(`✅ Passed 3.3 (Concurrency handled securely)`);
  
  console.log("Section 2 & 3 QA Complete.");
}

runTest().catch(console.error).finally(() => process.exit(0));
