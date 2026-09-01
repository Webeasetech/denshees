import { NextResponse } from "next/server";
import { tasks, auth } from "@trigger.dev/sdk";
import { trackServer, userIdFromToken } from "@/lib/analytics/server";
import { EVENTS } from "@/lib/analytics/events";

export async function POST(request) {
  try {
    const body = await request.json();
    const { employeeIds } = body;

    if (!employeeIds?.length) {
      return NextResponse.json(
        { error: "employeeIds array is required" },
        { status: 400 },
      );
    }

    const tag = `enrich-emails-${Date.now()}`;

    const handle = await tasks.trigger(
      "enrich-emails",
      { employeeIds },
      { tags: [tag] },
    );

    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          tags: [tag],
        },
      },
      expirationTime: "1hr",
    });

    await trackServer(EVENTS.LEAD_ENRICHED, userIdFromToken(request.headers.get("authorization")), {
      count: employeeIds.length,
    });

    return NextResponse.json({
      runId: handle.id,
      tag,
      publicToken,
    });
  } catch (error) {
    console.error("[API] lead/enrich error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to trigger enrichment" },
      { status: 500 },
    );
  }
}
