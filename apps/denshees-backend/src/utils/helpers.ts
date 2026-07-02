/**
 * Helper utilities for the email processor
 */

import Hogan from "hogan.js";
import { v4 as uuidv4 } from "uuid";
import { log } from "./logger.js";
import type { PitchRecord } from "../models/email.js";
import he from "he";

/**
 * Delays execution for a specified time.
 * @param {number} ms - Time to delay in milliseconds.
 * @returns {Promise} - Resolves after the given time.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validates an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether the email is valid
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
}

/**
 * Normalizes rich-editor HTML into clean, human-looking mail markup.
 *
 * Legacy templates (and jodit sessions that load them) store paragraphs as
 * <p> blocks, whose ~1em margins render as oversized double-gaps that make mail
 * look templated. This flattens block tags to <br> line breaks, decodes &nbsp;,
 * collapses excess breaks, and strips inline styles — so both new and existing
 * templates send with even, hand-typed spacing. Links (<a>) are preserved.
 *
 * @param html - Raw body HTML from the stored pitch.
 * @returns Normalized body HTML.
 */
export function normalizeEmailBody(html: string): string {
  if (!html) return "";

  return (
    html
      .replace(/&nbsp;/gi, " ")
      // Block boundary = a single line break, matching how the editor renders a
      // paragraph break. Intentional blank lines are authored as <br><br> INSIDE
      // a paragraph and are preserved as-is — mapping </p> to <br><br> here would
      // double them, inserting empty lines the author never added.
      .replace(/<\/(p|div)>/gi, "<br>")
      .replace(/<(p|div)[^>]*>/gi, "")
      // Drop editor pretty-print newlines that follow a <br> (kept invisible in
      // HTML but they bloat the text/plain alt with blank lines).
      .replace(/(<br\s*\/?>)[ \t]*\n[ \t]*/gi, "$1")
      // Drop whitespace/newlines sitting between consecutive <br> tags.
      .replace(/(<br\s*\/?>)\s+(?=<br)/gi, "$1")
      // Collapse 3+ consecutive breaks down to a single blank line.
      .replace(/(<br\s*\/?>\s*){3,}/gi, "<br><br>")
      // Trim leading/trailing breaks.
      .replace(/^(\s*<br\s*\/?>\s*)+/i, "")
      .replace(/(\s*<br\s*\/?>\s*)+$/i, "")
      // Strip inline styles left over from pasted content.
      .replace(/\s*style="[^"]*"/gi, "")
      .trim()
  );
}

/**
 * Applies Hogan.js personalization for email templates.
 * @param pitch - Pitch template with subject and message.
 * @param data - Personalization data.
 * @returns Personalized subject and body.
 */
export function applyHoganPersonalization(
  pitch: PitchRecord,
  data: Record<string, any>
): { subject: string; body: string } {
  const txId = uuidv4().substring(0, 8);
  log("INFO", `Applying Hogan personalization`, txId);

  try {
    const applyDefaults = (template: string): string =>
      template.replace(
        /\{\{\s*(\w+)\s*\|\s*"([^"]+)"\s*\}\}/g,
        (_, variable, defaultValue) =>
          data[variable] !== undefined && data[variable] !== null
            ? `{{${variable}}}`
            : defaultValue
      );

    const processedSubject = applyDefaults(pitch.subject);
    const processedBody = applyDefaults(pitch.message);

    log("INFO", `Compiling templates with Hogan`, txId);

    const compiledSubject = Hogan.compile(processedSubject);
    const compiledBody = Hogan.compile(processedBody);

    const renderedSubject = compiledSubject.render(data);
    const renderedBody = compiledBody.render(data);

    log("INFO", `Personalization complete`, txId, {
      subjectLength: renderedSubject.length,
      bodyLength: renderedBody.length,
    });

    return {
      subject: he.decode(renderedSubject),
      body: renderedBody,
    };
  } catch (error: any) {
    log("ERROR", `Error applying personalization`, txId, {
      error: error.message,
      stack: error.stack,
    });

    // Return original content if personalization fails
    return {
      subject: pitch.subject || "No Subject",
      body: pitch.message || "Email content could not be personalized.",
    };
  }
}

/**
 * Masks an email address for logging
 * @param email - Email address to mask
 * @returns Masked email address
 */
export function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null;

  const parts = email.split("@");
  if (parts.length !== 2) return email;

  const username = parts[0];
  const domain = parts[1];

  // Keep first 3 characters of username, mask the rest
  const maskedUsername =
    username.length > 3 ? username.substring(0, 3) + "***" : username + "***";

  return `${maskedUsername}@${domain}`;
}
