/**
 * Builds the query string shared by the leads list (`/api/contacts/paginatedapi`)
 * and the CSV export (`/api/contacts/export`), so the file a user downloads
 * always matches the rows they are looking at.
 *
 * @param {object} params
 * @param {string} params.campaignId
 * @param {string} [params.search]
 * @param {number} [params.page]
 * @param {{sentAtSort: string, stageFilter: string, statuses: string[]}} params.filters
 * @returns {string} URL-encoded query string, without the leading "?".
 */
export function buildLeadsQuery({ campaignId, search = "", page, filters }) {
  const query = new URLSearchParams({
    campaign: campaignId,
    search,
    sentAtSort: filters.sentAtSort,
    stage: filters.stageFilter,
    statuses: filters.statuses.join(","),
  });
  if (page) query.set("page", String(page));
  return query.toString();
}
