/**
 * Lead (CampaignEmail) statuses.
 *
 * `CampaignEmail.status` is a plain String column, not a Prisma enum, so this
 * list is the single source of truth for the values the app writes and filters
 * on. Backend writers: campaign-service.ts (PENDING → RUNNING → COMPLETED,
 * FAILED) and imap.service.ts (REPLIED, BOUNCED).
 */
export const LEAD_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "RUNNING", label: "Running" },
  { value: "REPLIED", label: "Replied" },
  { value: "COMPLETED", label: "Completed" },
  { value: "BOUNCED", label: "Bounced" },
  { value: "FAILED", label: "Failed" },
];

export const LEAD_STATUS_VALUES = LEAD_STATUSES.map((s) => s.value);

/**
 * Statuses shown before the user touches the filter: the leads a campaign is
 * still working on, plus the ones that answered. Terminal noise (completed,
 * bounced, failed) stays out of the way until asked for.
 */
export const DEFAULT_LEAD_STATUSES = ["PENDING", "RUNNING", "REPLIED"];

/**
 * Statuses a lead can still receive email in. Narrower than
 * `DEFAULT_LEAD_STATUSES`: a REPLIED lead is a live conversation, so the table
 * shows it by default, but the campaign has stopped sending to it — so it does
 * not count towards the leads still being worked.
 */
export const ACTIVE_LEAD_STATUSES = ["PENDING", "RUNNING"];

/**
 * Parses a comma-separated `statuses` query param into known values.
 * Returns null when nothing usable was passed, meaning "do not filter".
 *
 * @param {string|null} param
 * @returns {string[]|null}
 */
export function parseStatusFilter(param) {
  if (!param) return null;
  const statuses = param
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => LEAD_STATUS_VALUES.includes(s));
  return statuses.length ? statuses : null;
}
