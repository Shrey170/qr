import { StaffOrdersClient } from "./StaffOrdersClient";

export const dynamic = 'force-dynamic';

export default async function StaffDashboardPage() {
  // No baseUrl needed
  
  // We cannot easily fetch using standard fetch with auth headers in RSC without passing cookies.
  // Instead, fetch directly from DB or pass initialData from DB.
  
  // Since it's RSC, let's fetch initial data directly from Prisma to avoid fetch/cookie complexity.
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  const prisma = (await import("@/lib/prisma")).default;

  const session = await getServerSession(authOptions);
  
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

  const initialOrders = activeSessions
    .filter(s => s.orders.length > 0)
    .map(s => ({
      tableId: s.table.id,
      tableNumber: s.table.number,
      sessionId: s.id,
      orders: s.orders
    }))
    .sort((a, b) => a.tableNumber - b.tableNumber);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Active Orders</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <StaffOrdersClient initialData={initialOrders} />
      </div>
    </div>
  );
}
