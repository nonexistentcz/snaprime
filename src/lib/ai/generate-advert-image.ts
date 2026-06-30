import { generateImage } from "@tanstack/ai";
import { openaiImage } from "@tanstack/ai-openai";
import type { Advert } from "@/db/schema/advert";
import type { Brand } from "@/db/schema/brand";
import { withTimeout } from "./with-timeout";
import { assertImageCallWithinCostCap } from "./cost-cap";

const NUMBER_OF_IMAGES = 3;
// Up to ~$0.19 per image (gpt-image-1, high quality) — set the cap a little above the
// worst-case cost of this specific call rather than the generic per-call default.
const IMAGE_COST_CAP_USD_PER_IMAGE = 0.2;

export async function generateAdvertImage(
  advert: Advert,
  brand: Brand,
  numberOfImages = NUMBER_OF_IMAGES,
) {
  const prompt =
    `Create a complete, polished, ready-to-publish advertisement image for the brand "${brand.name ?? brand.hostname}". ` +
    `Render the following ad copy directly and legibly in the image, well composed and easy to read: ` +
    `Headline: "${advert.headline ?? ""}". ` +
    `Body: "${advert.bodyText ?? ""}". ` +
    `Call to action: "${advert.callToAction ?? ""}". ` +
    `Set this text against an attractive, friendly, inviting generated background scene that fits the brand — ` +
    `not a flat or plain color, something with depth and visual interest that supports rather than distracts from the text. ` +
    `Format: ${advert.format ?? "general"}. ` +
    `Brand tone: ${brand.tone ?? "(unspecified)"}. ` +
    `Use a color palette of ${
      [brand.palettePrimary, brand.paletteSecondary, brand.paletteTertiary]
        .filter(Boolean)
        .join(", ") || "the brand's choosing"
    }.`;

  assertImageCallWithinCostCap(
    "generateAdvertImage",
    numberOfImages,
    IMAGE_COST_CAP_USD_PER_IMAGE * numberOfImages,
  );

  const result = await withTimeout(
    "generateAdvertImage",
    () =>
      generateImage({
        adapter: openaiImage("gpt-image-1"),
        prompt,
        numberOfImages,
      }),
    60_000,
  );

  return Promise.all(
    result.images.map(async (image) => {
      if (image.b64Json) return Buffer.from(image.b64Json, "base64");
      const response = await fetch(image.url as string);
      return Buffer.from(await response.arrayBuffer());
    }),
  );
}
