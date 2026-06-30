const DEFAULT_AI_TIMEOUT_MS = 30_000;

export class AiTimeoutError extends Error {
  constructor(label: string, timeoutMs: number) {
    super(`AI call "${label}" timed out after ${timeoutMs}ms`);
    this.name = "AiTimeoutError";
  }
}

export async function withTimeout<T>(
  label: string,
  fn: () => Promise<T>,
  timeoutMs: number = DEFAULT_AI_TIMEOUT_MS,
): Promise<T> {
  const start = Date.now();
  let timer: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      console.error(`[ai] ${label} exceeded ${timeoutMs}ms latency cap`);
      reject(new AiTimeoutError(label, timeoutMs));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([fn(), timeout]);
    console.info(`[ai] ${label} completed in ${Date.now() - start}ms`);
    return result;
  } finally {
    clearTimeout(timer!);
  }
}
