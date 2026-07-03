import { StaffTablesClient } from "./StaffTablesClient";

export const dynamic = 'force-dynamic';

export default async function StaffTablesPage() {
  const prisma = (await import("@/lib/prisma")).default;

  const tables = await prisma.table.findMany({
    include: {
      sessions: {
        where: { status: 'ACTIVE' },
        include: {
          bills: true,
          orders: {
            where: { status: { not: 'CANCELLED' } }
          }
        }
      }
    },
    orderBy: { number: 'asc' }
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Table Status Board</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <StaffTablesClient initialData={tables} />
      </div>
    </div>
  );
}
