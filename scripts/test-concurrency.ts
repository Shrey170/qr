import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function placeOrder(sessionId: string, items: { menuItemId: string, quantity: number }[]) {
  const session = await prisma.tableSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: { table: true }
  });

  return await prisma.$transaction(async (tx) => {
    const itemIds = items.map(i => i.menuItemId);
    const menuItems = await tx.menuItem.findMany({
      where: { id: { in: itemIds } }
    });

    for (const reqItem of items) {
      const dbItem = menuItems.find(m => m.id === reqItem.menuItemId);
      if (!dbItem) throw new Error(`Item not found`);

      const result = await tx.menuItem.updateMany({
        where: { 
          id: reqItem.menuItemId,
          stockQty: { gte: reqItem.quantity },
          isAvailable: true
        },
        data: {
          stockQty: { decrement: reqItem.quantity }
        }
      });

      if (result.count === 0) {
        throw new Error(`Out of stock`);
      }
    }

    const order = await tx.order.create({
      data: {
        sessionId: session.id,
        tableId: session.tableId,
        status: 'PLACED',
        items: {
          create: items.map(reqItem => {
            const dbItem = menuItems.find(m => m.id === reqItem.menuItemId)!;
            return {
              menuItemId: dbItem.id,
              quantity: reqItem.quantity,
              unitPrice: dbItem.price,
              subtotal: dbItem.price * reqItem.quantity
            };
          })
        }
      }
    });

    for (const reqItem of items) {
      const dbItem = menuItems.find(m => m.id === reqItem.menuItemId)!;
      const newStock = dbItem.stockQty - reqItem.quantity;
      if (newStock === 0) {
        await tx.menuItem.update({
          where: { id: dbItem.id },
          data: { isAvailable: false }
        });
      }
    }

    return order;
  });
}

async function runConcurrencyTest() {
  console.log("Setting up concurrency test...");
  
  const table = await prisma.table.create({
    data: { number: 999, qrToken: "test-token-999", status: 'OCCUPIED' }
  });
  
  const session = await prisma.tableSession.create({
    data: { tableId: table.id }
  });

  const category = await prisma.menuCategory.create({
    data: { name: 'Test Category', sortOrder: 99 }
  });

  const item = await prisma.menuItem.create({
    data: {
      categoryId: category.id,
      name: 'Limited Item',
      price: 100,
      stockQty: 10,
      isAvailable: true
    }
  });

  console.log(`Created item with stock: ${item.stockQty}`);
  console.log(`Firing 15 concurrent orders of quantity 1...`);

  const promises = [];
  for (let i = 0; i < 15; i++) {
    promises.push(
      placeOrder(session.id, [{ menuItemId: item.id, quantity: 1 }])
        .then(() => 'SUCCESS')
        .catch((e) => 'FAILED')
    );
  }

  const results = await Promise.all(promises);
  
  const successes = results.filter(r => r === 'SUCCESS').length;
  const failures = results.filter(r => r === 'FAILED').length;

  console.log(`Results: ${successes} successful orders, ${failures} failed orders.`);

  const finalItem = await prisma.menuItem.findUnique({ where: { id: item.id } });
  console.log(`Final stock quantity: ${finalItem?.stockQty}`);

  if (finalItem?.stockQty === 10 - successes && (finalItem?.stockQty ?? -1) >= 0) {
    console.log('✅ Concurrency test passed: no overselling occurred. Stock is consistent.');
  } else {
    console.error('❌ Concurrency test failed: stock mismatch or oversold.');
  }

  // Cleanup
  await prisma.orderItem.deleteMany({ where: { menuItemId: item.id } });
  await prisma.order.deleteMany({ where: { sessionId: session.id } });
  await prisma.menuItem.delete({ where: { id: item.id } });
  await prisma.menuCategory.delete({ where: { id: category.id } });
  await prisma.tableSession.delete({ where: { id: session.id } });
  await prisma.table.delete({ where: { id: table.id } });
}

runConcurrencyTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
