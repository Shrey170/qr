import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    const session = await prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: {
        orders: {
          where: { status: { not: 'CANCELLED' } },
          include: { items: true }
        },
        bills: true
      }
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if there are any unserved orders. In a real restaurant, you can pay anytime or only when served.
    // Let's just calculate total of all non-cancelled items.
    let total = 0;
    session.orders.forEach(order => {
      order.items.forEach(item => {
        total += item.subtotal;
      });
    });

    const taxRate = 0.05; // 5% GST
    const taxAmount = total * taxRate;
    const finalTotal = total + taxAmount;

    // Check if bill exists, otherwise create it
    let bill = session.bills[0];
    if (!bill) {
      bill = await prisma.bill.create({
        data: {
          sessionId,
          totalAmount: finalTotal,
          taxAmount,
          status: 'PENDING'
        }
      });
    } else {
      // Update if changed
      if (bill.totalAmount !== finalTotal || bill.status === 'PENDING') {
        bill = await prisma.bill.update({
          where: { id: bill.id },
          data: { totalAmount: finalTotal, taxAmount }
        });
      }
    }

    return NextResponse.json({ bill, orders: session.orders });

  } catch (error) {
    console.error("Bill fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch bill" }, { status: 500 });
  }
}
