import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { trackServer, userIdFromToken } from "@/lib/analytics/server";
import { EVENTS } from "@/lib/analytics/events";
import { buildLeadsFilter } from "@/lib/leads-filter";

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const campaign = searchParams.get("campaign");

  try {
    const { where, orderBy } = buildLeadsFilter(searchParams);

    const records = await prisma.campaignEmail.findMany({ where, orderBy });

    await trackServer(EVENTS.CONTACTS_EXPORTED, userIdFromToken(request.headers.get("authorization")), {
      campaign_id: campaign,
      count: records.length,
    });

    return NextResponse.json({ items: records });
  } catch (error) {
    console.error(
      `[API] Error exporting contacts for campaign ${campaign}:`,
      error,
    );
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
