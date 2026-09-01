/**
 * Denshees tracking plan — single source of truth for event names.
 * Title Case, past-tense action. Imported by both browser and server helpers.
 */

export const EVENTS = {
  // A · Auth
  VIEWED_LOGIN_PAGE: "Viewed Login Page",
  SIGNED_UP: "Signed Up",
  SIGNED_UP_WITH_GOOGLE: "Signed Up with Google",
  LOGGED_IN: "Logged In",
  LOGIN_FAILED: "Login Failed",
  EMAIL_VERIFIED: "Email Verified",
  LOGGED_OUT: "Logged Out",

  // B · Onboarding
  VIEWED_ONBOARDING: "Viewed Onboarding",
  ONBOARDING_STEP_COMPLETED: "Onboarding Step Completed",
  SETUP_COMPLETED: "Setup Completed",
  TOUR_STARTED: "Tour Started",
  TOUR_COMPLETED: "Tour Completed",

  // C · Mailbox connection
  VIEWED_SETTINGS: "Viewed Settings",
  MAILBOX_CONNECT_STARTED: "Mailbox Connect Started",
  MAILBOX_CONNECT_SUCCEEDED: "Mailbox Connect Succeeded",
  MAILBOX_SMTP_TEST_FAILED: "Mailbox SMTP Test Failed",
  MAILBOX_IMAP_TEST_FAILED: "Mailbox IMAP Test Failed",
  MAILBOX_DISCONNECTED: "Mailbox Disconnected",
  GOOGLE_APP_CONNECTED: "Google App Connected",

  // D · Leads & lists
  VIEWED_LISTS: "Viewed Lists",
  LEAD_LIST_CREATED: "Lead List Created",
  LEAD_LIST_OPENED: "Lead List Opened",
  LEADS_IMPORTED: "Leads Imported",
  LEADS_IMPORTED_FROM_FILE: "Leads Imported from File",
  LEAD_IMPORT_FAILED: "Lead Import Failed",
  LEADS_PARSED_BY_AI: "Leads Parsed by AI",
  LEAD_ENRICHED: "Lead Enriched",
  LEADS_FOUND_FROM_DOMAIN: "Leads Found from Domain",
  LEAD_DELETED: "Lead Deleted",
  CONTACTS_EXPORTED: "Contacts Exported",

  // E · Campaigns
  VIEWED_CAMPAIGNS: "Viewed Campaigns",
  CAMPAIGN_CREATED: "Campaign Created",
  CAMPAIGN_OPENED: "Campaign Opened",
  VIEWED_CAMPAIGN_BUILDER: "Viewed Campaign Builder",
  CAMPAIGN_NODE_ADDED: "Campaign Node Added",
  PITCH_CREATED: "Pitch Created",
  PITCH_UPDATED: "Pitch Updated",
  PITCH_DELETED: "Pitch Deleted",
  PITCH_ENHANCED_WITH_AI: "Pitch Enhanced with AI",
  CAMPAIGN_RECIPIENTS_SELECTED: "Campaign Recipients Selected",
  CAMPAIGN_SETTINGS_UPDATED: "Campaign Settings Updated",
  CAMPAIGN_LAUNCHED: "Campaign Launched",
  CAMPAIGN_PAUSED: "Campaign Paused",
  CAMPAIGN_DELETED: "Campaign Deleted",

  // F · Sending & delivery (Hono backend)
  EMAIL_SEND_ATTEMPTED: "Email Send Attempted",
  EMAIL_SENT: "Email Sent",
  EMAIL_SEND_FAILED: "Email Send Failed",
  EMAIL_OPENED: "Email Opened",
  REPLY_RECEIVED: "Reply Received",
  DAILY_LIMIT_REACHED: "Daily Limit Reached",

  // G · CRM
  VIEWED_CRM: "Viewed CRM",
  DEAL_CREATED: "Deal Created",
  DEAL_STAGE_CHANGED: "Deal Stage Changed",
  DEALS_BULK_CREATED: "Deals Bulk Created",
  STAGE_CREATED: "Stage Created",
  ACTIVITY_LOGGED: "Activity Logged",

  // H · AI agent
  AGENT_THREAD_CREATED: "Agent Thread Created",
  AGENT_MESSAGE_SENT: "Agent Message Sent",
  AGENT_RESPONSE_RECEIVED: "Agent Response Received",
  AGENT_RUN_FAILED: "Agent Run Failed",
  AI_CREDITS_CONSUMED: "AI Credits Consumed",

  // I · Analytics & billing
  VIEWED_DASHBOARD: "Viewed Dashboard",
  VIEWED_CAMPAIGN_ANALYTICS: "Viewed Campaign Analytics",
  VIEWED_FREE_CREDITS: "Viewed Free Credits",
  CHECKOUT_STARTED: "Checkout Started",
  PAYMENT_COMPLETED: "Payment Completed",
  CREDITS_PURCHASED: "Credits Purchased",
  SUPPORT_QUERY_SUBMITTED: "Support Query Submitted",
};
