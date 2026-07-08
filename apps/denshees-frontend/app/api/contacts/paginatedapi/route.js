import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildLeadsFilter } from "@/lib/leads-filter";

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const campaign = searchParams.get("campaign");
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 15;

  try {
    const { where, orderBy } = buildLeadsFilter(searchParams);

    const [items, totalItems] = await Promise.all([
      prisma.campaignEmail.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
        include: { cred: { select: { username: true } } },
      }),
      prisma.campaignEmail.count({ where }),
    ]);

    // Reshape to match old format: put cred in expand
    const shapedItems = items.map((item) => {
      const { cred, ...rest } = item;
      return { ...rest, expand: { cred: cred || undefined } };
    });

    return NextResponse.json({
      items: shapedItems,
      totalItems,
      page,
      perPage,
      totalPages: Math.ceil(totalItems / perPage),
    });
  } catch (error) {
    console.error(
      `[API] Error getting paginated contacts for campaign ${campaign}:`,
      error,
    );
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
