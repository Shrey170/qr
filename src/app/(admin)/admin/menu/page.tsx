import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function AdminMenuPage() {
  const categories = await prisma.menuCategory.findMany({
    include: { items: true },
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Menu Manager</h1>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white">Add Category</Button>
      </div>

      <div className="space-y-8">
        {categories.map(category => (
          <Card key={category.id}>
            <CardHeader className="bg-gray-50 border-b flex flex-row justify-between items-center py-3">
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <Button variant="outline" size="sm">Add Item</Button>
            </CardHeader>
            <CardContent className="pt-4">
              {category.items.length === 0 ? (
                <p className="text-gray-500 text-sm">No items in this category.</p>
              ) : (
                <div className="space-y-4">
                  {category.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.name}</span>
                          {!item.isAvailable && <Badge variant="destructive">Unavailable</Badge>}
                          {item.stockQty <= item.lowStockThreshold && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">Low Stock</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">₹{item.price}</p>
                          <p className="text-xs text-gray-500">Stock: {item.stockQty}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
