import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const brands = pgTable("brands", {
  id:               serial("id").primaryKey(),
  name:             text("name"),
  logoUrl:          text("logo_url"),
  tone:             text("tone"),
  slogan:           text("slogan"),
  targetAudience:   text("target_audience"),
  industry:         text("industry"),
  values:           text("values"),
  language:         text("language"),
  // palette
  palettePrimary:   text("palette_primary"),
  paletteSecondary: text("palette_secondary"),
  paletteTertiary:  text("palette_tertiary"),
  // social handles
  socialInstagram:  text("social_instagram"),
  socialFacebook:   text("social_facebook"),
  socialTwitter:    text("social_twitter"),
  socialLinkedin:   text("social_linkedin"),
  socialTiktok:     text("social_tiktok"),
  socialYoutube:    text("social_youtube"),
});

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
