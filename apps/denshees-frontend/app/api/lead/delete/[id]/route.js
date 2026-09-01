export const revalidate = 0;
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { trackServer, userIdFromToken } from "@/lib/analytics/server";
import { EVENTS } from "@/lib/analytics/events";

export async function DELETE(request, { params }) {
  const lead = params.id;

  try {
    await prisma.campaignEmail.delete({ where: { id: lead } });
    await trackServer(EVENTS.LEAD_DELETED, userIdFromToken(request.headers.get("authorization")), {
      lead_id: lead,
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error(`[API] Error deleting lead ${lead}:`, error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
