import { chromium } from "playwright";

export async function scrape(
  url: string
): Promise<{ html: string; screenshot: Buffer }> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    const html = await page.content();
    const screenshot = await page.screenshot();
    return { html, screenshot };
  } finally {
    await browser.close();
  }
}
