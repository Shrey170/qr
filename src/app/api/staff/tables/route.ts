import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'STAFF' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tables = await prisma.table.findMany({
      include: {
        sessions: {
          where: { status: 'ACTIVE' },
          include: {
            bills: true,
            orders: {
              where: { status: { not: 'CANCELLED' } }
            }
          }
        }
      },
      orderBy: { number: 'asc' }
    });

    return NextResponse.json(tables);

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}
