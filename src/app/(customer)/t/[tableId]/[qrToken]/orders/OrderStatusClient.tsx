"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, CheckCircle2, UtensilsCrossed } from "lucide-react";
import Pusher from "pusher-js";

const STATUS_MAP: Record<string, { label: string; icon: any; color: string }> = {
  PLACED: { label: "Order Placed", icon: Clock, color: "bg-blue-100 text-blue-800" },
  ACCEPTED: { label: "Accepted", icon: CheckCircle2, color: "bg-indigo-100 text-indigo-800" },
  PREPARING: { label: "Preparing", icon: ChefHat, color: "bg-yellow-100 text-yellow-800" },
  READY: { label: "Ready", icon: UtensilsCrossed, color: "bg-orange-100 text-orange-800" },
  SERVED: { label: "Served", icon: CheckCircle2, color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", icon: Clock, color: "bg-red-100 text-red-800" },
};

export function OrderStatusClient({ initialOrders, sessionId }: { initialOrders: any[], sessionId: string }) {
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '6877d1b8c5c8b24d8ef7', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2'
    });

    const channel = pusher.subscribe(`session-${sessionId}`);
    channel.bind('order-status-update', (data: any) => {
      setOrders(prev => prev.map(o => o.id === data.orderId ? { ...o, status: data.status } : o));
    });

    return () => {
      pusher.unsubscribe(`session-${sessionId}`);
    };
  }, [sessionId]);

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {orders.map((order) => {
        const statusObj = STATUS_MAP[order.status] || STATUS_MAP.PLACED;
        const Icon = statusObj.icon;
        
        return (
          <Card key={order.id} className="overflow-hidden shadow-sm">
            <CardHeader className="bg-gray-50 pb-4 border-b">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500" suppressHydrationWarning>
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <Badge variant="secondary" className={`flex items-center gap-1 ${statusObj.color}`}>
                  <Icon className="h-3 w-3" />
                  {statusObj.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {order.items.map((item: any) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {item.quantity} x {item.menuItem.name}
                    </span>
                    <span className="text-gray-500">₹{item.subtotal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
