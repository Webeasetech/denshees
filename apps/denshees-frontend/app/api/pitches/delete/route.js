import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Deletes the LAST follow-up stage of a campaign. Restricted to the highest
// stage (never stage 0 / the first email) to keep the stage sequence contiguous.
// Blocked when any lead is currently at or past that stage, since removing its
// template would leave the sender with no pitch to send (→ FAILED).
export async function DELETE(request) {
  const searchParams = new URL(request.url).searchParams;
  const pitchId = searchParams.get("pitch");

  if (!pitchId) {
    return NextResponse.json({ message: "pitch is required" }, { status: 400 });
  }

  try {
    const pitch = await prisma.pitchEmail.findUnique({
      where: { id: pitchId },
      select: { id: true, stage: true, campaignId: true },
    });

    if (!pitch) {
      return NextResponse.json({ message: "Pitch not found" }, { status: 404 });
    }

    if ((pitch.stage ?? 0) === 0) {
      return NextResponse.json(
        { message: "The first email cannot be deleted." },
        { status: 400 },
      );
    }

    // Must be the highest-numbered stage.
    const last = await prisma.pitchEmail.findFirst({
      where: { campaignId: pitch.campaignId },
      orderBy: { stage: "desc" },
      select: { stage: true },
    });

    if (last?.stage !== pitch.stage) {
      return NextResponse.json(
        { message: "Only the last follow-up can be deleted." },
        { status: 400 },
      );
    }

    // Guard: don't strand leads sitting at or beyond this stage.
    const inFlight = await prisma.campaignEmail.count({
      where: {
        campaignId: pitch.campaignId,
        stage: { gte: pitch.stage },
        status: { in: ["PENDING", "RUNNING"] },
      },
    });

    if (inFlight > 0) {
      return NextResponse.json(
        {
          message: `Can't remove this follow-up — ${inFlight} lead(s) are currently at this stage. Wait until they progress or reply.`,
        },
        { status: 409 },
      );
    }

    // Delete the pitch and shrink the completion cap in lockstep.
    // Remaining stages are 0..(pitch.stage - 1), so maxStageCount = pitch.stage.
    await prisma.$transaction([
      prisma.pitchEmail.delete({ where: { id: pitch.id } }),
      prisma.campaign.update({
        where: { id: pitch.campaignId },
        data: { maxStageCount: pitch.stage },
      }),
    ]);

    return NextResponse.json({ message: "Follow-up removed", stage: pitch.stage });
  } catch (error) {
    console.error(`[API] Error deleting pitch ${pitchId}:`, error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
