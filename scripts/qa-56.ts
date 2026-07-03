import prisma from '../src/lib/prisma';

async function runTest() {
  console.log("Starting Section 5 & 6 QA...");
  const baseUrl = "http://localhost:3000";

  // Grab the session we just used in QA-3, or create a new one
  const session = await prisma.tableSession.findFirst({
    where: { status: 'ACTIVE' },
    include: { table: true }
  });

  if (!session) {
    throw new Error("No active session found. Please run qa-3.ts first or create one.");
  }

  // 1. Hit the Bill GET endpoint
  console.log(`[Test 5.1] View Bill shows correct itemized total`);
  const billRes = await fetch(`${baseUrl}/api/bills/${session.id}`);
  const billData = await billRes.json();
  
  if (!billRes.ok) throw new Error(`Failed 5.1: ${JSON.stringify(billData)}`);
  
  // Verify math. QA-3 added 1 item of 100, and 1 item of 50 (concurrency test). Total should be 150.
  const dbOrders = await prisma.order.findMany({
    where: { sessionId: session.id },
    include: { items: true }
  });
  const expectedSubtotal = dbOrders.flatMap(o => o.items).reduce((acc, item) => acc + item.subtotal, 0);
  const expectedTax = expectedSubtotal * 0.05;
  const expectedTotal = expectedSubtotal + expectedTax;

  if (billData.bill.totalAmount !== expectedTotal) {
    throw new Error(`Failed 5.1: Expected total ${expectedTotal}, got ${billData.bill.totalAmount}`);
  }
  console.log(`✅ Passed 5.1`);

  console.log(`[Test 6.2] Complete Payment (Mock Razorpay)`);
  const payRes = await fetch(`${baseUrl}/api/bills/${session.id}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_payment_id: "mock_payment_" + Date.now(),
      razorpay_order_id: "mock_order_" + Date.now(),
      razorpay_signature: "mock_sig"
    })
  });
  const payData = await payRes.json();
  if (!payRes.ok) throw new Error(`Failed 6.2: ${JSON.stringify(payData)}`);

  const updatedBill = await prisma.bill.findUnique({ where: { id: billData.bill.id } });
  if (updatedBill?.status !== 'PAID') {
    throw new Error(`Failed 6.2: Bill status is ${updatedBill?.status}`);
  }
  console.log(`✅ Passed 6.2 (Bill Paid)`);

  console.log(`[Test 6.3] Table Release: Session Closed, Table Available`);
  const finalSession = await prisma.tableSession.findUnique({ where: { id: session.id } });
  if (finalSession?.status !== 'CLOSED') {
    throw new Error(`Failed 6.3: Session status is ${finalSession?.status}`);
  }
  
  const finalTable = await prisma.table.findUnique({ where: { id: session.tableId } });
  if (finalTable?.status !== 'AVAILABLE') {
    throw new Error(`Failed 6.3: Table status is ${finalTable?.status}`);
  }
  console.log(`✅ Passed 6.3 (Table Freed)`);

  console.log(`[Test 6.6] Attempt Double Pay -> safely rejected`);
  const payRes2 = await fetch(`${baseUrl}/api/bills/${session.id}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_payment_id: "mock_payment2",
      razorpay_order_id: "mock_order2",
      razorpay_signature: "mock_sig2"
    })
  });
  if (payRes2.ok) {
    throw new Error(`Failed 6.6: Double pay succeeded!`);
  }
  console.log(`✅ Passed 6.6 (Double pay rejected)`);

  console.log("Section 5 & 6 QA Complete.");
}

runTest().catch(console.error).finally(() => process.exit(0));
