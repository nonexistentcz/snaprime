import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { adverts } from "@/db/schema/advert";
import { brands } from "@/db/schema/brand";
import { advertImages } from "@/db/schema/advert-image";
import { generateAdvert } from "@/lib/ai/generate-advert";
import { generateAdvertImage } from "@/lib/ai/generate-advert-image";

export const advertStatusValues = ["Draft", "Active", "Inactive"] as const;

export const advertInput = z.object({
  headline: z.string().nullable().optional(),
  bodyText: z.string().nullable().optional(),
  callToAction: z.string().nullable().optional(),
  format: z.string().nullable().optional(),
  status: z.enum(advertStatusValues).nullable().optional(),
});

export const listAdverts = createServerFn({ method: "GET" })
  .validator(z.number())
  .handler(({ data: brandId }) =>
    db.select().from(adverts).where(eq(adverts.brandId, brandId))
  );

export const getAdvert = createServerFn({ method: "GET" })
  .validator(z.number())
  .handler(async ({ data: advertId }) => {
    const [advert] = await db
      .select()
      .from(adverts)
      .where(eq(adverts.id, advertId));
    return advert ?? null;
  });

export const createAdvertFromBrand = createServerFn({ method: "POST" })
  .validator(z.object({ brandId: z.number() }))
  .handler(async ({ data: input }) => {
    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, input.brandId));
    if (!brand) throw new Error("Brand not found");

    const generated = await generateAdvert(brand);
    const [advert] = await db
      .insert(adverts)
      .values({ ...generated, brandId: input.brandId })
      .returning();
    return advert;
  });

export const updateAdvert = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number(), data: advertInput }))
  .handler(async ({ data: input }) => {
    const [advert] = await db
      .update(adverts)
      .set(input.data)
      .where(eq(adverts.id, input.id))
      .returning();
    return advert ?? null;
  });

export const listAdvertImages = createServerFn({ method: "GET" })
  .validator(z.number())
  .handler(async ({ data: advertId }) => {
    const images = await db
      .select()
      .from(advertImages)
      .where(eq(advertImages.advertId, advertId));
    return images.map((image) => ({
      id: image.id,
      data: image.data.toString("base64"),
    }));
  });

export const generateImage = createServerFn({ method: "POST" })
  .validator(z.number())
  .handler(async ({ data: advertId }) => {
    const [advert] = await db
      .select()
      .from(adverts)
      .where(eq(adverts.id, advertId));
    if (!advert) throw new Error("Advert not found");

    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, advert.brandId));
    if (!brand) throw new Error("Brand not found");

    const images = await generateAdvertImage(advert, brand);

    const inserted = await db
      .insert(advertImages)
      .values(images.map((data) => ({ advertId, data })))
      .returning();

    return inserted.map((image) => ({
      id: image.id,
      data: image.data.toString("base64"),
    }));
  });

export const regenerateImage = createServerFn({ method: "POST" })
  .validator(z.number())
  .handler(async ({ data: imageId }) => {
    const [existing] = await db
      .select()
      .from(advertImages)
      .where(eq(advertImages.id, imageId));
    if (!existing) throw new Error("Image not found");

    const [advert] = await db
      .select()
      .from(adverts)
      .where(eq(adverts.id, existing.advertId));
    if (!advert) throw new Error("Advert not found");

    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, advert.brandId));
    if (!brand) throw new Error("Brand not found");

    const [image] = await generateAdvertImage(advert, brand, 1);

    const [updated] = await db
      .update(advertImages)
      .set({ data: image })
      .where(eq(advertImages.id, imageId))
      .returning();

    return { id: updated.id, data: updated.data.toString("base64") };
  });
