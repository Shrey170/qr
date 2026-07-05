import prisma from "@/lib/prisma";
import { CustomerMenuClient } from "./CustomerMenuClient";

import { getBaseUrl } from "@/lib/utils";

interface PageProps {
  params: {
    tableId: string;
    qrToken: string;
  };
}

export default async function TableSessionPage({ params }: PageProps) {
  const { tableId, qrToken } = params;

  // Validate the QR token and create/resume a session.
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/tables/${tableId}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrToken }),
    cache: 'no-store'
  });

  if (!res.ok) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Invalid QR Code</h2>
        <p className="text-gray-600">Please scan the QR code on your table again.</p>
      </div>
    );
  }

  const { sessionId, tableNumber } = await res.json();

  // Fetch the menu server-side
  const categories = await prisma.menuCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      items: true
    }
  });

  return <CustomerMenuClient categories={categories} sessionId={sessionId} tableNumber={tableNumber} qrToken={qrToken} tableId={tableId} />;
}
