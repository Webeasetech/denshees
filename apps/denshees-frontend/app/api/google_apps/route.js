import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import prisma from "@/lib/prisma";
import { activeCampaignWhere } from "@/lib/credential-usage";

export async function GET(request) {
  const token = request.headers.get("authorization");

  try {
    const user = jwtDecode(token);
    const records = await prisma.emailCredential.findMany({
      where: { userId: user.userId },
    });

    // Count active campaigns each credential is selected in, so the UI can
    // decide whether it is safe to delete without an extra round-trip.
    const activeJoins = await prisma.campaignEmailCredential.findMany({
      where: {
        emailCredentialId: { in: records.map((r) => r.id) },
        ...activeCampaignWhere(),
      },
      select: { emailCredentialId: true },
    });

    const activeCounts = activeJoins.reduce((acc, join) => {
      acc[join.emailCredentialId] = (acc[join.emailCredentialId] || 0) + 1;
      return acc;
    }, {});

    const withUsage = records.map((record) => ({
      ...record,
      activeCampaignCount: activeCounts[record.id] || 0,
    }));

    return NextResponse.json(withUsage);
  } catch (error) {
    console.error("[API] Error getting email credentials:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
