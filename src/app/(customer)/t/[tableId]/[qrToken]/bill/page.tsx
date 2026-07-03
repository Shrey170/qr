import { BillClient } from "./BillClient";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function BillPage({ params }: { params: { tableId: string, qrToken: string } }) {
  const { tableId, qrToken } = params;

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: {
      sessions: {
        where: { status: 'ACTIVE' },
        take: 1
      }
    }
  });

  if (!table || table.qrToken !== qrToken || table.sessions.length === 0) {
    return <div className="p-4 text-center">Session not found or invalid QR.</div>;
  }

  const session = table.sessions[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/t/${tableId}/${qrToken}/orders`} className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">Your Bill</h1>
      </div>
      <BillClient sessionId={session.id} tableNumber={table.number} />
    </div>
  );
}
