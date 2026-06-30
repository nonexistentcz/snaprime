import { pgTable, pgEnum, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { brands } from "./brand";

export const advertStatusEnum = pgEnum("advert_status", [
  "Draft",
  "Active",
  "Inactive",
]);

export const adverts = pgTable("adverts", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id")
    .notNull()
    .references(() => brands.id),
  headline: text("headline"),
  bodyText: text("body_text"),
  callToAction: text("call_to_action"),
  format: text("format"),
  status: advertStatusEnum("status"),
  prompt: text("prompt"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Advert = typeof adverts.$inferSelect;
export type NewAdvert = typeof adverts.$inferInsert;
