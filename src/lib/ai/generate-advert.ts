import { chat } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import { advertInput } from "@/server/functions/advert";
import type { Brand } from "@/db/schema/brand";
import { withTimeout } from "./with-timeout";
import { assertTextCallWithinCostCap } from "./cost-cap";

export async function generateAdvert(brand: Brand) {
  const brandJson = JSON.stringify(brand, null, 2);
  assertTextCallWithinCostCap("generateAdvert", brandJson);

  return withTimeout("generateAdvert", () =>
    chat({
      adapter: openaiText("gpt-4o"),
      stream: false,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              content:
                "Generate ad copy for this brand. Write a headline, body text, and a call to action " +
                "that fit the brand's tone, slogan, target audience, and industry. Also suggest a " +
                "sensible ad format (e.g. social, banner, search). Set status to \"Draft\".\n\n" +
                `Brand:\n${brandJson}`,
            },
          ],
        },
      ],
      outputSchema: advertInput,
    }),
  );
}
