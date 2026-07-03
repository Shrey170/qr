import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'STAFF' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeSessions = await prisma.tableSession.findMany({
      where: { status: 'ACTIVE' },
      include: {
        table: true,
        orders: {
          where: {
            status: { in: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'] }
          },
          include: {
            items: { include: { menuItem: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    const tablesWithOrders = activeSessions
      .filter(session => session.orders.length > 0)
      .map(session => ({
        tableId: session.table.id,
        tableNumber: session.table.number,
        sessionId: session.id,
        orders: session.orders
      }))
      .sort((a, b) => a.tableNumber - b.tableNumber);

    return NextResponse.json(tablesWithOrders);

  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
