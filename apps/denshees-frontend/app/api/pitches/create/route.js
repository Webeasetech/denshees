import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Appends a new follow-up stage to a campaign. The new stage is always added at
// the end (stage = current max + 1) to keep the stage sequence contiguous, and
// Campaign.maxStageCount is bumped in lockstep so the sender's completion cap
// stays in sync with the actual pitch rows.
export async function POST(request) {
  const searchParams = new URL(request.url).searchParams;
  const campaign = searchParams.get("campaign");
  const body = await request.json().catch(() => ({}));
  const delayDays = body.delayDays !== undefined ? Number(body.delayDays) : 2;

  if (!campaign) {
    return NextResponse.json(
      { message: "campaign is required" },
      { status: 400 },
    );
  }

  try {
    const last = await prisma.pitchEmail.findFirst({
      where: { campaignId: campaign },
      orderBy: { stage: "desc" },
      select: { stage: true },
    });

    const nextStage = (last?.stage ?? -1) + 1;

    const [pitch] = await prisma.$transaction([
      prisma.pitchEmail.create({
        data: {
          title: `Follow Up ${nextStage}`,
          message: "Hey {{name}}, I am just following up on my previous emails.",
          subject: "Following Up {{name}}!",
          campaignId: campaign,
          stage: nextStage,
          delayDays,
        },
      }),
      prisma.campaign.update({
        where: { id: campaign },
        data: { maxStageCount: nextStage + 1 },
      }),
    ]);

    return NextResponse.json(pitch);
  } catch (error) {
    console.error(`[API] Error creating pitch for campaign ${campaign}:`, error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
