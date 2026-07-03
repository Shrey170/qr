import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'STAFF' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const orderId = params.id;

    // Use a transaction or simply update with current status condition if it was provided.
    // Since frontend doesn't provide current status, we just update it.
    // However, to satisfy concurrency rules "no duplicate state transitions",
    // we can fetch the order first, or if it's already at this status, do nothing.
    const currentOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (currentOrder?.status === status) {
      return NextResponse.json({ success: true, order: currentOrder });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    try {
      await pusherServer.trigger(`session-${order.sessionId}`, 'order-status-update', { 
        orderId, 
        status 
      });
    } catch (e) {
      console.error("Pusher trigger failed:", e);
    }

    return NextResponse.json({ success: true, order });

  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
