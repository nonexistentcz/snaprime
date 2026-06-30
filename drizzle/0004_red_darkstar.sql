CREATE TYPE "public"."advert_status" AS ENUM('Draft', 'Active', 'Inactive');--> statement-breakpoint
UPDATE "adverts" SET "status" = 'Draft' WHERE "status" IS NOT NULL AND "status" NOT IN ('Draft', 'Active', 'Inactive');--> statement-breakpoint
ALTER TABLE "adverts" ALTER COLUMN "status" SET DATA TYPE "public"."advert_status" USING "status"::"public"."advert_status";