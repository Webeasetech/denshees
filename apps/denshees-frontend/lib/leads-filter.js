import { parseStatusFilter } from "@/lib/constants/lead-status";

/**
 * Translates the leads query params into Prisma `where` / `orderBy` clauses.
 * Shared by `/api/contacts/paginatedapi` and `/api/contacts/export` so the CSV
 * and the table always agree on what a filter means.
 *
 * @param {URLSearchParams} searchParams
 * @returns {{where: object, orderBy: object}}
 */
export function buildLeadsFilter(searchParams) {
  const campaign = searchParams.get("campaign");
  const search = searchParams.get("search") || "";
  const stage = searchParams.get("stage") || "ALL";
  const statuses = parseStatusFilter(searchParams.get("statuses"));

  const where = { campaignId: campaign };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (stage !== "ALL") {
    where.stage = parseInt(stage);
  }

  if (statuses) {
    where.status = { in: statuses };
  }

  const orderBy =
    searchParams.get("sentAtSort") === "OLDEST_FIRST"
      ? { sentAt: "asc" }
      : { sentAt: "desc" };

  return { where, orderBy };
}
