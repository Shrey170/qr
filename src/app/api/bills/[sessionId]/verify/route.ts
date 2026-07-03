import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    // 1. Find pending bill
    const bill = await prisma.bill.findFirst({
      where: { sessionId, status: 'PENDING' }
    });

    if (!bill) {
      return NextResponse.json({ error: "No pending bill found" }, { status: 400 });
    }

    // 2. Atomic update to prevent double-processing
    const result = await prisma.bill.updateMany({
      where: { id: bill.id, status: 'PENDING' },
      data: {
        status: 'PAID',
        paymentId: paymentId,
        paidAt: new Date()
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Bill already processed" }, { status: 400 });
    }

    // 3. Create payment record and close session inside transaction
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          billId: bill.id,
          provider: 'RAZORPAY',
          providerRefId: paymentId,
          amount: bill.totalAmount,
          status: 'SUCCESS',
        }
      }),
      prisma.tableSession.update({
        where: { id: sessionId },
        data: { status: 'CLOSED', endedAt: new Date() }
      })
    ]);

    // 4. Also release table
    const session = await prisma.tableSession.findUnique({ where: { id: sessionId }});
    if (session) {
      await prisma.table.update({
        where: { id: session.tableId },
        data: { status: 'AVAILABLE', currentSessionId: null }
      });
    }

    return NextResponse.json({ success: true, paymentId });

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
