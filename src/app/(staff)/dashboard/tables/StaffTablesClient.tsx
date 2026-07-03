"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StaffTablesClient({ initialData }: { initialData: any[] }) {
  const [tables, setTables] = useState(initialData);

  useEffect(() => {
    // Basic polling for updates
    const interval = setInterval(fetchTables, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/staff/tables");
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-20">
      {tables.map((table: any) => {
        const activeSession = table.sessions[0];
        let statusColor = "bg-gray-100 border-gray-300 text-gray-700";
        let statusText = "Available";
        let summary = "";

        if (activeSession) {
          const pendingBill = activeSession.bills.find((b: any) => b.status === 'PENDING');
          if (pendingBill) {
            statusColor = "bg-red-50 border-red-300 text-red-800";
            statusText = "Awaiting Payment";
            summary = `Bill: ₹${pendingBill.totalAmount}`;
          } else {
            statusColor = "bg-blue-50 border-blue-300 text-blue-800";
            statusText = "Occupied";
            summary = `${activeSession.orders.length} orders`;
          }
        }

        return (
          <Card key={table.id} className={`border-2 shadow-sm flex flex-col h-32 justify-center items-center ${statusColor} transition-colors`}>
            <CardHeader className="p-2 text-center pb-0">
              <CardTitle className="text-3xl font-bold">
                T{table.number}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 text-center space-y-1">
              <Badge variant="outline" className={`border-current ${statusColor}`}>
                {statusText}
              </Badge>
              {summary && <p className="text-xs font-semibold mt-1">{summary}</p>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
