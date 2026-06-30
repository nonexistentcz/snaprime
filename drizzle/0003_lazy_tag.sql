CREATE TABLE "advert_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"advert_id" integer NOT NULL,
	"data" bytea NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "advert_images" ADD CONSTRAINT "advert_images_advert_id_adverts_id_fk" FOREIGN KEY ("advert_id") REFERENCES "public"."adverts"("id") ON DELETE no action ON UPDATE no action;