import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { qrToken } = await request.json();
    const tableId = params.id;

    if (!qrToken) {
      return NextResponse.json({ error: "Missing QR token" }, { status: 400 });
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        sessions: {
          where: { status: 'ACTIVE' },
          orderBy: { startedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!table || table.qrToken !== qrToken) {
      return NextResponse.json({ error: "Invalid QR code or table not found" }, { status: 404 });
    }

    // Try to atomically claim the table if it's AVAILABLE
    const result = await prisma.table.updateMany({
      where: { id: table.id, status: 'AVAILABLE' },
      data: { status: 'OCCUPIED' }
    });

    if (result.count === 1) {
      // Successfully claimed
      const session = await prisma.tableSession.create({
        data: { tableId: table.id }
      });
      await prisma.table.update({
        where: { id: table.id },
        data: { currentSessionId: session.id }
      });
      return NextResponse.json({ 
        sessionId: session.id,
        tableNumber: table.number,
        status: "CREATED"
      });
    }

    // Table was not AVAILABLE. Check for existing ACTIVE session to resume.
    // Wait slightly to ensure any concurrent session creation completes its table update
    await new Promise(resolve => setTimeout(resolve, 50));

    const activeSession = await prisma.tableSession.findFirst({
      where: { tableId: table.id, status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' }
    });

    if (activeSession) {
      return NextResponse.json({ 
        sessionId: activeSession.id,
        tableNumber: table.number,
        status: "RESUMED"
      });
    }

    // Edge case: Table was not AVAILABLE, but no ACTIVE session exists.
    // E.g., someone just paid the bill and it transitioned away from ACTIVE, but table update hasn't propagated or was lost.
    // Force claim it.
    const session = await prisma.tableSession.create({
      data: { tableId: table.id }
    });
    await prisma.table.update({
      where: { id: table.id },
      data: { status: 'OCCUPIED', currentSessionId: session.id }
    });

    return NextResponse.json({ 
      sessionId: session.id,
      tableNumber: table.number,
      status: "CREATED"
    });

  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: "Failed to process scan" }, { status: 500 });
  }
}
