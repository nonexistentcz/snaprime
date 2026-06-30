ALTER TABLE "brands" ADD COLUMN "hostname" text;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_hostname_unique" UNIQUE("hostname");
