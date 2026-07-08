import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildLeadsFilter } from "@/lib/leads-filter";

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const campaign = searchParams.get("campaign");

  try {
    const { where, orderBy } = buildLeadsFilter(searchParams);

    const records = await prisma.campaignEmail.findMany({ where, orderBy });

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
