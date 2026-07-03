import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminBillsPage() {
  const bills = await prisma.bill.findMany({
    orderBy: { paidAt: 'desc' },
    include: {
      session: {
        include: {
          table: true
        }
      }
    },
    take: 50 // Show last 50 bills
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bills History</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bills.map(bill => (
          <Card key={bill.id} className="shadow-sm">
            <CardHeader className="pb-2 border-b bg-gray-50">
              <CardTitle className="flex justify-between items-center text-lg">
                <span className="flex items-center gap-2"><Receipt className="h-5 w-5"/> Table {bill.session.table.number}</span>
                <Badge variant={bill.status === 'PAID' ? "default" : "secondary"} className={bill.status === 'PAID' ? "bg-green-600" : ""}>
                  {bill.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-semibold text-lg">₹{bill.totalAmount}</span>
              </div>
              {bill.paymentId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="font-mono text-xs">{bill.paymentId}</span>
                </div>
              )}
              {bill.paidAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Paid At</span>
                  <span>{new Date(bill.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(bill.paidAt).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {bills.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No bills generated yet.
          </div>
        )}
      </div>
    </div>
  );
}
