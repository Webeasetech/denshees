// Shared logic for deciding whether an email credential can be deleted.
// A credential may only be removed when it is not selected in any *active*
// campaign. Active = a non-deleted campaign that has not finished sending.

export const ACTIVE_CAMPAIGN_STATUSES = ["RUNNING", "PENDING"];

// Whether a single campaign counts as "active" for credential-usage purposes.
export function isCampaignActive(campaign) {
  return (
    !!campaign &&
    campaign.deleted === false &&
    ACTIVE_CAMPAIGN_STATUSES.includes(campaign.status)
  );
}

// Prisma `where` fragment to filter join rows down to active campaigns only.
export function activeCampaignWhere() {
  return {
    campaign: {
      deleted: false,
      status: { in: ACTIVE_CAMPAIGN_STATUSES },
    },
  };
}
