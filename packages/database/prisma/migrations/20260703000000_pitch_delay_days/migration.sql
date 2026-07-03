-- AlterTable: per-stage send delay (days to wait before sending this stage)
ALTER TABLE "pitches_email" ADD COLUMN "delay_days" INTEGER DEFAULT 1;

-- Backfill existing pitches with their campaign's global days_interval so live
-- campaigns keep their current cadence. Stage-0 rows are never gated by delay,
-- so leaving them at the default is harmless.
UPDATE "pitches_email" p
SET "delay_days" = c."days_interval"
FROM "campaigns" c
WHERE p."campaign" = c."id"
  AND c."days_interval" IS NOT NULL;
