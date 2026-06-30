import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { brands } from "@/db/schema/brand";
import { scrape } from "@/lib/cloudflare/scrape";
import { extractBrand } from "@/lib/ai/extract-brand";

export const brandInput = z.object({
  hostname: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  tone: z.string().nullable().optional(),
  slogan: z.string().nullable().optional(),
  targetAudience: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  values: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  palettePrimary: z.string().nullable().optional(),
  paletteSecondary: z.string().nullable().optional(),
  paletteTertiary: z.string().nullable().optional(),
  socialInstagram: z.string().nullable().optional(),
  socialFacebook: z.string().nullable().optional(),
  socialTwitter: z.string().nullable().optional(),
  socialLinkedin: z.string().nullable().optional(),
  socialTiktok: z.string().nullable().optional(),
  socialYoutube: z.string().nullable().optional(),
});

export const listBrands = createServerFn({ method: "GET" }).handler(() =>
  db.select().from(brands)
);

export const getBrand = createServerFn({ method: "GET" })
  .validator(z.number())
  .handler(async ({ data: brandId }) => {
    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, brandId));
    return brand ?? null;
  });

export const createBrand = createServerFn({ method: "POST" })
  .validator(brandInput)
  .handler(async ({ data }) => {
    const [brand] = await db.insert(brands).values(data).returning();
    return brand;
  });

export const updateBrand = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number(), data: brandInput }))
  .handler(async ({ data: input }) => {
    const [brand] = await db
      .update(brands)
      .set(input.data)
      .where(eq(brands.id, input.id))
      .returning();
    return brand ?? null;
  });

export const createBrandFromUrl = createServerFn({ method: "POST" })
  .validator(z.object({ url: z.url() }))
  .handler(async ({ data: input }) => {
    const hostname = new URL(input.url).hostname;

    const [existing] = await db
      .select()
      .from(brands)
      .where(eq(brands.hostname, hostname));
    if (existing) return existing;

    const scraped = await scrape(input.url);
    const extracted = await extractBrand(scraped);
    const [brand] = await db
      .insert(brands)
      .values({ ...extracted, hostname })
      .returning();
    return brand;
  });

export const refetchBrand = createServerFn({ method: "POST" })
  .validator(z.number())
  .handler(async ({ data: brandId }) => {
    const [existing] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, brandId));
    if (!existing || !existing.hostname) return null;

    const scraped = await scrape(`https://${existing.hostname}`);
    const extracted = await extractBrand(scraped);
    const [brand] = await db
      .update(brands)
      .set(extracted)
      .where(eq(brands.id, brandId))
      .returning();
    return brand ?? null;
  });
