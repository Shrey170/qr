import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        items: true,
      }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
