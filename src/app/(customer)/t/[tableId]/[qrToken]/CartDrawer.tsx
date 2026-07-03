"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CartDrawer({ qrToken, tableId }: { qrToken: string, tableId: string }) {
  const { items, getCartTotal, addItem, removeItem, clearCart, sessionId, tableNumber } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const router = useRouter();

  const total = getCartTotal();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  if (itemCount === 0) return null;

  const handlePlaceOrder = async () => {
    if (!sessionId) return;
    setIsPlacingOrder(true);
    
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          items: items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity }))
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Failed to place order");
        setIsPlacingOrder(false);
        return;
      }

      toast.success("Order placed successfully!");
      clearCart();
      setIsOpen(false);
      
      // Navigate to order tracking page
      router.push(`/t/${tableId}/${qrToken}/orders`);
      
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 max-w-md mx-auto">
        <Button 
          className="w-full h-14 text-lg font-semibold bg-orange-600 hover:bg-orange-700 text-white flex justify-between px-6"
          onClick={() => setIsOpen(true)}
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            View Cart ({itemCount})
          </span>
          <span>₹{total}</span>
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[80vh] max-w-md mx-auto rounded-t-xl px-0 pb-0 flex flex-col">
          <SheetHeader className="px-6 pb-4 border-b">
            <SheetTitle>Your Order</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex justify-between items-center py-2">
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-500">₹{item.price}</p>
                </div>
                
                <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-md"
                    onClick={() => removeItem(item.menuItemId)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-md bg-white shadow-sm"
                    onClick={() => addItem(item)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="w-16 text-right font-semibold">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t bg-gray-50 p-6 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span>₹{total}</span>
            </div>
            <Button 
              className="w-full h-14 text-lg bg-orange-600 hover:bg-orange-700" 
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Place Order
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
