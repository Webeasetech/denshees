import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { trackServer, userIdFromToken } from "@/lib/analytics/server";
import { EVENTS } from "@/lib/analytics/events";

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const campaign = searchParams.get("campaign");

  if (!campaign) {
    return NextResponse.json(
      { message: "campaign is required" },
      { status: 400 },
    );
  }

  try {
    const records = await prisma.crmStage.findMany({
      where: { campaignId: campaign },
      orderBy: { order: "asc" },
    });

    const normalized = records.map((r) => ({
      ...r,
      is_won: r.isWon,
      is_lost: r.isLost,
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("[API] Error getting CRM stages:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const body = await request.json();

  try {
    const record = await prisma.crmStage.create({
      data: {
        name: body.name,
        campaignId: body.campaign,
        order: body.order,
        color: body.color,
        isWon: body.is_won || false,
        isLost: body.is_lost || false,
      },
    });
    await trackServer(EVENTS.STAGE_CREATED, userIdFromToken(request.headers.get("authorization")), {
      campaign_id: body.campaign,
      is_won: Boolean(body.is_won),
      is_lost: Boolean(body.is_lost),
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("[API] Error creating CRM stage:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
