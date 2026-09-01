import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { trackServer, userIdFromToken } from "@/lib/analytics/server";
import { EVENTS } from "@/lib/analytics/events";

export async function PATCH(request) {
  const searchParams = new URL(request.url).searchParams;
  const pitch = searchParams.get("pitch");
  const { message, subject, delayDays } = await request.json();

  // Build the update conditionally so a partial save (e.g. only delayDays) does
  // not wipe the other fields.
  const data = {};
  if (message !== undefined) data.message = message;
  if (subject !== undefined) data.subject = subject;
  if (delayDays !== undefined) data.delayDays = Number(delayDays);

  try {
    const record = await prisma.pitchEmail.update({
      where: { id: pitch },
      data,
    });

    await trackServer(EVENTS.PITCH_UPDATED, userIdFromToken(request.headers.get("authorization")), {
      pitch_id: pitch,
      has_subject: Boolean(subject),
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error(`[API] Error updating pitch ${pitch}:`, error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
