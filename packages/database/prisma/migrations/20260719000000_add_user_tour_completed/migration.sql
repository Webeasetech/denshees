-- AlterTable: gate the product walkthrough (react-joyride tour) per user.
-- Defaults false so existing users see the tour once; flipped true when they
-- complete, skip, or close it.
ALTER TABLE "users" ADD COLUMN "tour_completed" BOOLEAN NOT NULL DEFAULT false;
