import puppeteer from "@cloudflare/puppeteer";
import { env } from "cloudflare:workers";

const DNS_ERROR_PATTERNS = [
  "ERR_NAME_NOT_RESOLVED",
  "ERR_CONNECTION_REFUSED",
  "ERR_CONNECTION_TIMED_OUT",
  "ERR_ADDRESS_UNREACHABLE",
];

export async function scrape(
  url: string
): Promise<{ html: string; screenshot: Buffer }> {
  const browser = await puppeteer.launch(env.MYBROWSER);
  try {
    const page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle0" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (DNS_ERROR_PATTERNS.some((pattern) => message.includes(pattern))) {
        throw new Error(
          `${new URL(url).hostname} does not exist or could not be reached.`
        );
      }
      throw error;
    }
    const html = await page.content();
    const screenshot = await page.screenshot();
    return { html, screenshot };
  } finally {
    await browser.close();
  }
}
