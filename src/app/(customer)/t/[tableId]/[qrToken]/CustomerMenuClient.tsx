"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { CartDrawer } from "./CartDrawer";

export function CustomerMenuClient({ categories, sessionId, tableNumber, qrToken, tableId }: any) {
  const { setSession, items, addItem, removeItem } = useCartStore();

  useEffect(() => {
    setSession(sessionId, tableNumber);
  }, [sessionId, tableNumber, setSession]);

  return (
    <div className="space-y-8">
      <div className="bg-orange-100 p-4 rounded-lg flex items-center justify-between shadow-sm">
        <div>
          <p className="text-orange-800 font-semibold">Table {tableNumber}</p>
          <p className="text-sm text-orange-600">Session active</p>
        </div>
      </div>

      {categories.map((cat: any) => (
        <div key={cat.id} className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">{cat.name}</h2>
          <div className="grid gap-4">
            {cat.items.map((item: any) => {
              const cartItem = items.find((i) => i.menuItemId === item.id);
              const qty = cartItem?.quantity || 0;
              const isUnavailable = !item.isAvailable || item.stockQty <= 0;

              return (
                <Card key={item.id} className={isUnavailable ? "opacity-60" : "shadow-sm"}>
                  <CardContent className="p-4 flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{item.name}</h3>
                        <span className="font-medium">₹{item.price}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        {isUnavailable ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : (
                          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1 w-fit">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-md text-gray-600 hover:text-black"
                              onClick={() => removeItem(item.id)}
                              disabled={qty === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{qty}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-md bg-white shadow-sm hover:text-orange-600"
                              onClick={() => addItem({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1 })}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
      <CartDrawer qrToken={qrToken} tableId={tableId} />
    </div>
  );
}
