import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runConcurrencyTests() {
  console.log("Starting Concurrency Tests...");

  // 1. TableSession Race
  console.log("\n--- Test 1: TableSession Race ---");
  const table = await prisma.table.findFirst();
  if (!table) throw new Error("No table found");
  
  await prisma.table.update({
    where: { id: table.id },
    data: { status: 'AVAILABLE', currentSessionId: null }
  });
  await prisma.tableSession.updateMany({ where: { tableId: table.id }, data: { status: 'CLOSED' } });

  console.log(`Firing 5 concurrent scan requests for Table ${table.number}`);
  const scanPromises = Array.from({ length: 5 }).map(() => 
    fetch(`http://localhost:3000/api/tables/${table.id}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken: table.qrToken })
    }).then(res => res.json())
  );

  const scanResults = await Promise.all(scanPromises);
  const createdSessions = await prisma.tableSession.findMany({ where: { tableId: table.id, status: 'ACTIVE' } });
  console.log(`Sessions created: ${createdSessions.length} (Expected: 1)`);
  if (createdSessions.length !== 1) {
    console.error("FAIL: Multiple sessions created!");
  } else {
    console.log("PASS: Only one session created.");
  }

  const sessionId = createdSessions[0].id;

  // 2. Order Stock Race
  console.log("\n--- Test 2: Order Stock Race ---");
  const category = await prisma.menuCategory.findFirst();
  let item = await prisma.menuItem.findFirst({ where: { name: "Concurrency Burger" } });
  if (!item) {
    item = await prisma.menuItem.create({
      data: { name: "Concurrency Burger", price: 100, stockQty: 3, isAvailable: true, categoryId: category!.id }
    });
  } else {
    await prisma.menuItem.update({ where: { id: item.id }, data: { stockQty: 3, isAvailable: true } });
  }

  console.log("Firing 5 concurrent order requests for an item with stock = 3");
  const orderPromises = Array.from({ length: 5 }).map(() => 
    fetch(`http://localhost:3000/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        items: [{ menuItemId: item!.id, quantity: 1 }]
      })
    }).then(res => res.json())
  );

  const orderResults = await Promise.all(orderPromises);
  const successfulOrders = orderResults.filter(r => r.success);
  const failedOrders = orderResults.filter(r => r.error);
  
  const updatedItem = await prisma.menuItem.findUnique({ where: { id: item.id } });
  
  console.log(`Successful orders: ${successfulOrders.length} (Expected: 3)`);
  console.log(`Failed orders: ${failedOrders.length} (Expected: 2)`);
  console.log(`Final stock: ${updatedItem?.stockQty} (Expected: 0)`);
  console.log(`Is Available: ${updatedItem?.isAvailable} (Expected: false)`);

  if (successfulOrders.length !== 3 || updatedItem?.stockQty !== 0 || updatedItem?.isAvailable !== false) {
    console.error("FAIL: Stock race condition triggered!");
  } else {
    console.log("PASS: Stock strictly enforced.");
  }

  // 3. Double-submit Pay Race
  console.log("\n--- Test 3: Double-submit Pay Race ---");
  // We need to create a bill first
  const orderIds = successfulOrders.map(o => o.orderId);
  const dbOrders = await prisma.order.findMany({ where: { id: { in: orderIds } }, include: { items: true }});
  const total = dbOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.subtotal, 0), 0);
  
  await prisma.bill.create({
    data: {
      sessionId,
      totalAmount: total * 1.05,
      taxAmount: total * 0.05,
      status: 'PENDING'
    }
  });

  console.log("Firing 3 concurrent verify payment requests");
  const payPromises = Array.from({ length: 3 }).map(() => 
    fetch(`http://localhost:3000/api/bills/${sessionId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: "mock_concurrent_pay" })
    }).then(res => res.json())
  );

  const payResults = await Promise.all(payPromises);
  const successfulPays = payResults.filter(r => r.success);
  const failedPays = payResults.filter(r => r.error);

  const payments = await prisma.payment.findMany({ where: { providerRefId: "mock_concurrent_pay" } });
  
  console.log(`Successful payments: ${successfulPays.length} (Expected: 1)`);
  console.log(`Failed payments: ${failedPays.length} (Expected: 2)`);
  console.log(`Payment DB records: ${payments.length} (Expected: 1)`);

  if (successfulPays.length !== 1 || payments.length !== 1) {
    console.error("FAIL: Double payment processed!");
  } else {
    console.log("PASS: Double payment prevented.");
  }

  console.log("\nConcurrency Tests Complete.");
}

runConcurrencyTests().catch(console.error);
