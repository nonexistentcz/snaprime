import { pgTable, serial, integer, customType, timestamp } from "drizzle-orm/pg-core";
import { adverts } from "./advert";

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const advertImages = pgTable("advert_images", {
  id: serial("id").primaryKey(),
  advertId: integer("advert_id")
    .notNull()
    .references(() => adverts.id),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AdvertImage = typeof advertImages.$inferSelect;
export type NewAdvertImage = typeof advertImages.$inferInsert;
