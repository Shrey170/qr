import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QRCode from "react-qr-code";

export const dynamic = 'force-dynamic';

export default async function AdminTablesPage() {
  const tables = await prisma.table.findMany({ orderBy: { number: 'asc' }});
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Table QR Codes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map(table => {
          const url = `${baseUrl}/t/${table.id}/${table.qrToken}`;
          return (
            <Card key={table.id}>
              <CardHeader className="pb-2 border-b">
                <CardTitle>Table {table.number}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col items-center text-center space-y-4">
                <div className="w-40 h-40 flex items-center justify-center border shadow-sm rounded-lg p-2 bg-white">
                  <QRCode value={url} size={130} />
                </div>
                <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline break-all bg-blue-50 p-2 rounded">
                  {url}
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
