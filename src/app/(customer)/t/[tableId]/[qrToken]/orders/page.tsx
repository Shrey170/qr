import prisma from "@/lib/prisma";
import { OrderStatusClient } from "./OrderStatusClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function OrderStatusPage({ params }: { params: { tableId: string, qrToken: string } }) {
  const { tableId, qrToken } = params;

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: {
      sessions: {
        where: { status: 'ACTIVE' },
        include: {
          orders: {
            include: {
              items: { include: { menuItem: true } }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  if (!table || table.qrToken !== qrToken || table.sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">No Active Session</h2>
        <p className="text-gray-600">Please scan your table QR code to start a session.</p>
      </div>
    );
  }

  const session = table.sessions[0];
  const orders = session.orders;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/t/${tableId}/${qrToken}`} className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Your Orders</h1>
        </div>
        <Link href={`/t/${tableId}/${qrToken}/bill`}>
          <Button variant="outline" className="border-orange-600 text-orange-600 font-semibold">
            View Bill
          </Button>
        </Link>
      </div>

      <OrderStatusClient initialOrders={orders} sessionId={session.id} />
    </div>
  );
}
