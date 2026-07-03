"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Receipt } from "lucide-react";
import Script from "next/script";

export function BillClient({ sessionId, tableNumber }: { sessionId: string, tableNumber: number }) {
  const [billData, setBillData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchBill();
  }, [sessionId]);

  const fetchBill = async () => {
    try {
      const res = await fetch(`/api/bills/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setBillData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (typeof window === "undefined" || !(window as any).Razorpay) {
      toast.error("Payment system not loaded. Please wait.");
      return;
    }
    setPaying(true);
    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SXqMGaL0u6rWEZ",
        amount: Math.round(billData.bill.totalAmount * 100), // Amount in paise
        currency: "INR",
        name: "TableServe",
        description: `Table ${tableNumber} Bill`,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`/api/bills/${sessionId}/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId: response.razorpay_payment_id }),
            });
            const data = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success("Payment successful!");
              window.location.href = "/";
            } else {
              toast.error(data.error || "Payment verification failed");
              setPaying(false);
            }
          } catch (e) {
            toast.error("Verification error");
            setPaying(false);
          }
        },
        prefill: {
          name: "Guest User",
          contact: "9999999999"
        },
        theme: { color: "#ea580c" },
        modal: {
          ondismiss: function() {
            setPaying(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description || "Payment failed");
        setPaying(false);
      });
      rzp.open();
    } catch (e) {
      toast.error("Payment initialization error");
      setPaying(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;
  
  if (!billData || billData.orders.length === 0) {
    return <div className="text-center p-8 text-gray-500">No items on your bill yet.</div>;
  }

  const { bill, orders } = billData;

  return (
    <div className="space-y-6 pb-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Card>
        <CardHeader className="bg-gray-50 border-b pb-4">
          <CardTitle className="flex justify-between items-center text-lg">
            <span className="flex items-center gap-2"><Receipt className="h-5 w-5"/> Table {tableNumber} Bill</span>
            <span className={bill.status === 'PAID' ? "text-green-600" : "text-orange-600"}>{bill.status}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="space-y-2">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity} x {item.menuItem?.name || 'Item'}</span>
                  <span className="font-medium">₹{item.subtotal}</span>
                </div>
              ))}
            </div>
          ))}
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{bill.totalAmount - bill.taxAmount}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxes (5%)</span>
              <span>₹{bill.taxAmount}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
              <span>Total</span>
              <span>₹{bill.totalAmount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {bill.status === 'PENDING' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-40 max-w-md mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button 
            className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
            onClick={handlePayment}
            disabled={paying}
          >
            {paying ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Pay ₹{bill.totalAmount}
          </Button>
        </div>
      )}
    </div>
  );
}
