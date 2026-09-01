import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { trackServer, userIdFromToken } from "@/lib/analytics/server";
import { EVENTS } from "@/lib/analytics/events";

export const revalidate = 0;

export async function GET(request, props) {
  const params = await props.params;
  const { id } = params;

  try {
    const campaignEmailCreds = await prisma.campaignEmailCredential.findMany({
      where: { campaignId: id },
      include: { emailCredential: true },
    });

    const emails = campaignEmailCreds.map((cec) => cec.emailCredential);
    await trackServer(EVENTS.CAMPAIGN_RECIPIENTS_SELECTED, userIdFromToken(request.headers.get("authorization")), {
      campaign_id: params.id,
      count: emails.length,
    });

    return NextResponse.json(emails);
  } catch (error) {
    console.error(
      `[API] Error getting selected emails for campaign ${id}:`,
      error,
    );
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
