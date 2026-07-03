import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bills = await prisma.bill.findMany({
    where: {
      status: 'PAID',
      paidAt: { gte: today }
    }
  });

  const totalRevenue = bills.reduce((acc, bill) => acc + bill.totalAmount, 0);
  const totalOrders = await prisma.order.count({
    where: {
      createdAt: { gte: today }
    }
  });

  const lowStockItems = await prisma.menuItem.findMany({
    where: { stockQty: { lte: 5 } }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Today's Sales Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-gray-500">Revenue Today</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold">₹{totalRevenue}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-gray-500">Orders Today</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold">{totalOrders}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-gray-500">Paid Bills</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold">{bills.length}</p></CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mt-8">Low Stock Alerts</h2>
      {lowStockItems.length === 0 ? (
        <p className="text-gray-500">No items are low on stock.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {lowStockItems.map(item => (
            <Card key={item.id} className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900">{item.name}</p>
                <p className="text-red-700 text-sm mt-1">{item.stockQty} left in stock</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
