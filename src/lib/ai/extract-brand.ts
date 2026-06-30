import { chat } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import { brandInput } from "@/server/functions/brand";
import { withTimeout } from "./with-timeout";
import { assertTextCallWithinCostCap } from "./cost-cap";

function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .slice(0, 50_000);
}

export async function extractBrand({
  html,
  screenshot,
}: {
  html: string;
  screenshot: Buffer;
}) {
  const cleanedHtml = cleanHtml(html);
  assertTextCallWithinCostCap("extractBrand", cleanedHtml);

  return withTimeout("extractBrand", () =>
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
                "Extract brand identity information from this webpage. " +
                "Use the screenshot for visual cues (logo, color palette, tone) " +
                "and the HTML for text-based details (slogan, social links, target audience). " +
                "Be very careful. Leave fields blank if you cannot determine them confidently.\n\n" +
                `HTML:\n${cleanedHtml}`,
            },
            {
              type: "image",
              source: {
                type: "data",
                value: screenshot.toString("base64"),
                mimeType: "image/png",
              },
            },
          ],
        },
      ],
      outputSchema: brandInput,
    })
  );
}
