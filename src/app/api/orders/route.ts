import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, items } = body;

    if (!sessionId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const session = await prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: { table: true }
    });

    if (!session || session.status !== 'ACTIVE') {
      return NextResponse.json({ error: "Invalid or inactive session" }, { status: 400 });
    }

    const orderResult = await prisma.$transaction(async (tx) => {
      // 1. Fetch current details for price calculation
      const itemIds = items.map(i => i.menuItemId);
      const menuItems = await tx.menuItem.findMany({
        where: { id: { in: itemIds } }
      });

      // 2. Atomically validate and decrement stock
      for (const reqItem of items) {
        const dbItem = menuItems.find(m => m.id === reqItem.menuItemId);
        if (!dbItem) {
          throw new Error(`Item not found: ${reqItem.menuItemId}`);
        }

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
          throw new Error(`Not enough stock for ${dbItem.name}. Only ${dbItem.stockQty} left.`);
        }
      }

      // 3. Create the order
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

      // 4. Log inventory and auto-disable if stock hits 0
      for (const reqItem of items) {
        const freshItem = await tx.menuItem.findUnique({ where: { id: reqItem.menuItemId } });
        
        if (freshItem && freshItem.stockQty === 0 && freshItem.isAvailable) {
          await tx.menuItem.update({
            where: { id: freshItem.id },
            data: { isAvailable: false }
          });
        }

        await tx.inventoryLog.create({
          data: {
            menuItemId: reqItem.menuItemId,
            orderId: order.id,
            changeQty: -reqItem.quantity,
            reason: `Order placed (Table ${session.table.number})`
          }
        });
      }

      return order;
    });

    try {
      await pusherServer.trigger('staff-dashboard', 'new-order', {
        tableNumber: session.table.number,
        orderId: orderResult.id
      });
    } catch (e) {
      console.error("Pusher trigger failed:", e);
    }
    
    return NextResponse.json({ success: true, orderId: orderResult.id });

  } catch (error: any) {
    console.error("Order error:", error);
    return NextResponse.json({ error: error.message || "Failed to place order" }, { status: 400 });
  }
}
