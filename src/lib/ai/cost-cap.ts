// Conservative per-call dollar budget, enforced as an upper-bound estimate before the call is
// made (rather than after, which would mean the money is already spent).
const DEFAULT_COST_CAP_USD = 0.5;

// gpt-4o pricing (USD per token), used to bound the cost of text calls from input size alone.
// https://openai.com/api/pricing/
const GPT_4O_INPUT_PER_TOKEN = 2.5 / 1_000_000;
const GPT_4O_OUTPUT_PER_TOKEN = 10 / 1_000_000;
const MAX_OUTPUT_TOKENS_ESTIMATE = 2_000;

// gpt-image-1 pricing (USD per image, worst case "high" quality, largest size).
// https://openai.com/api/pricing/
const GPT_IMAGE_1_PER_IMAGE_USD = 0.19;

export class AiCostCapError extends Error {
  constructor(label: string, estimatedCostUsd: number, capUsd: number) {
    super(
      `AI call "${label}" estimated cost $${estimatedCostUsd.toFixed(4)} exceeds cap $${capUsd.toFixed(2)}`,
    );
    this.name = "AiCostCapError";
  }
}

function assertWithinCap(label: string, estimatedCostUsd: number, capUsd: number) {
  console.info(`[ai] ${label} estimated cost: $${estimatedCostUsd.toFixed(4)}`);
  if (estimatedCostUsd > capUsd) {
    throw new AiCostCapError(label, estimatedCostUsd, capUsd);
  }
}

// ~4 characters per token is a standard rough estimate for English text.
function estimateTokensFromText(text: string): number {
  return Math.ceil(text.length / 4);
}

export function assertTextCallWithinCostCap(
  label: string,
  inputText: string,
  capUsd: number = DEFAULT_COST_CAP_USD,
) {
  const inputTokens = estimateTokensFromText(inputText);
  const estimatedCostUsd =
    inputTokens * GPT_4O_INPUT_PER_TOKEN +
    MAX_OUTPUT_TOKENS_ESTIMATE * GPT_4O_OUTPUT_PER_TOKEN;
  assertWithinCap(label, estimatedCostUsd, capUsd);
}

export function assertImageCallWithinCostCap(
  label: string,
  numberOfImages: number,
  capUsd: number = DEFAULT_COST_CAP_USD,
) {
  const estimatedCostUsd = numberOfImages * GPT_IMAGE_1_PER_IMAGE_USD;
  assertWithinCap(label, estimatedCostUsd, capUsd);
}
