"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock } from "lucide-react";

export function StaffOrdersClient({ initialData }: { initialData: any[] }) {
  const [tablesWithOrders, setTablesWithOrders] = useState(initialData);

  useEffect(() => {
    // We will implement real Pusher here in Task 22 or similar.
    // For now, we poll or just rely on initialData. 
    // To satisfy "Real-time feed" requirement using Pusher (Task 18):
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '6877d1b8c5c8b24d8ef7', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2'
    });

    const channel = pusher.subscribe('staff-dashboard');
    channel.bind('new-order', (data: any) => {
      fetchOrders();
    });

    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/staff/orders");
      if (res.ok) {
        const data = await res.json();
        setTablesWithOrders(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Order marked as ${newStatus}`);
        fetchOrders();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("Error updating status");
    }
  };

  if (tablesWithOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-xl">No active orders</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
      {tablesWithOrders.map((tableGrp) => (
        <Card key={tableGrp.sessionId} className="border-t-4 border-t-orange-500 shadow-sm flex flex-col h-full max-h-[80vh]">
          <CardHeader className="pb-3 border-b bg-gray-50">
            <CardTitle className="flex justify-between items-center text-lg">
              <span>Table {tableGrp.tableNumber}</span>
              <Badge variant="secondary">{tableGrp.orders.length} Orders</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1 overflow-y-auto space-y-6">
            {tableGrp.orders.map((order: any) => (
              <div key={order.id} className="space-y-3 bg-white p-3 rounded-lg border shadow-sm">
                <div className="flex justify-between items-center">
                  <Badge 
                    variant="outline" 
                    className={
                      order.status === 'PLACED' ? 'bg-blue-50 text-blue-700' :
                      order.status === 'ACCEPTED' ? 'bg-indigo-50 text-indigo-700' :
                      order.status === 'PREPARING' ? 'bg-yellow-50 text-yellow-700' :
                      order.status === 'READY' ? 'bg-orange-50 text-orange-700' :
                      'bg-gray-50 text-gray-700'
                    }
                  >
                    {order.status}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center gap-1" suppressHydrationWarning>
                    <Clock className="h-3 w-3" />
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <ul className="text-sm space-y-1">
                  {order.items.map((item: any) => (
                    <li key={item.id} className="flex justify-between">
                      <span><span className="font-semibold">{item.quantity}x</span> {item.menuItem.name}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-3 border-t mt-3 flex flex-wrap gap-2">
                  {order.status === 'PLACED' && (
                    <Button size="sm" onClick={() => updateOrderStatus(order.id, 'ACCEPTED')} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Accept</Button>
                  )}
                  {order.status === 'ACCEPTED' && (
                    <Button size="sm" onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="flex-1 bg-yellow-600 hover:bg-yellow-700">Prepare</Button>
                  )}
                  {order.status === 'PREPARING' && (
                    <Button size="sm" onClick={() => updateOrderStatus(order.id, 'READY')} className="flex-1 bg-orange-600 hover:bg-orange-700">Ready</Button>
                  )}
                  {order.status === 'READY' && (
                    <Button size="sm" onClick={() => updateOrderStatus(order.id, 'SERVED')} className="flex-1 bg-green-600 hover:bg-green-700">Served</Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
