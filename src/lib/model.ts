import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { openai } from "@ai-sdk/openai";
import type { LanguageModelV4 } from "@ai-sdk/provider";

/**
 * Provider chain: OpenAI (paid credit, cheapest model) first when its key is
 * set; on rate limits or exhausted credit the SAME request silently retries
 * on Gemini's free tier, then Groq's. The visible countdown only appears when
 * every provider in the chain is saturated.
 */

// Free-tier reality check (2026-07): gemini-3.5-flash rejects with "high
// demand", gemini-2.5-flash is retired for new users — the lite tier has
// stable capacity. Override per environment without code changes.
const PRIMARY_MODEL = process.env.GENUI_MODEL ?? "gemini-flash-lite-latest";
// Cheapest OpenAI model with solid tool calling ($0.05/M in, $0.40/M out).
const OPENAI_MODEL = process.env.GENUI_OPENAI_MODEL ?? "gpt-5-nano";
// gpt-oss-120b's free tier allows only 8k tokens/min (observed 2026-07-11) —
// barely two of our ~4k-token requests; llama-3.3-70b has more headroom and
// equally solid tool calling.
const FALLBACK_MODEL =
  process.env.GENUI_FALLBACK_MODEL ?? "llama-3.3-70b-versatile";

/** Parse "retry in 40.3s" / "try again in 29m36.4s" → seconds, or null. */
export function retryDelaySeconds(error: unknown): number | null {
  const message = error instanceof Error ? error.message : "";
  const match = message.match(/(?:retry|try again) in (?:(\d+)m)?([\d.]+)\s*s/i);
  if (!match) return null;
  return Math.ceil(Number(match[1] ?? 0) * 60 + Number(match[2]));
}

export function isRateLimitError(error: unknown): boolean {
  const statusCode = (error as { statusCode?: number } | null)?.statusCode;
  if (statusCode === 429 || statusCode === 503 || statusCode === 529) return true;
  const message = error instanceof Error ? error.message : "";
  return /quota|high demand|resource.?exhausted|rate.?limit/i.test(message);
}

export function withFallback(models: LanguageModelV4[]): LanguageModelV4 {
  const primary = models[0];

  async function tryEach<T>(
    run: (model: LanguageModelV4) => PromiseLike<T>,
  ): Promise<T> {
    let bestError: unknown;
    for (const model of models) {
      try {
        return await run(model);
      } catch (error) {
        // Only capacity problems justify switching provider mid-request.
        if (!isRateLimitError(error)) throw error;
        // When the whole chain is saturated, surface the SHORTEST wait —
        // Gemini frees up in seconds while Groq's daily cap wants 30 minutes.
        const current = retryDelaySeconds(error) ?? Infinity;
        const best = retryDelaySeconds(bestError) ?? Infinity;
        if (bestError === undefined || current < best) bestError = error;
      }
    }
    throw bestError;
  }

  return {
    specificationVersion: "v4",
    provider: primary.provider,
    modelId: models.map((model) => model.modelId).join(" -> "),
    supportedUrls: primary.supportedUrls,
    doGenerate: (options) => tryEach((model) => model.doGenerate(options)),
    doStream: (options) => tryEach((model) => model.doStream(options)),
  };
}

/**
 * gpt-oss models on Groq think out loud: their chain of thought must be
 * parsed into reasoning parts or it streams as visible text. Other Groq
 * models reject those options outright ("reasoning_effort is not supported").
 */
export function groqProviderOptions():
  | { reasoningFormat: "parsed"; reasoningEffort: "low" }
  | undefined {
  return FALLBACK_MODEL.includes("gpt-oss")
    ? { reasoningFormat: "parsed", reasoningEffort: "low" }
    : undefined;
}

/** Providers join the chain only when their keys are configured. */
export function buildChatModel(): LanguageModelV4 {
  const chain: LanguageModelV4[] = [];
  if (process.env.OPENAI_API_KEY) chain.push(openai(OPENAI_MODEL));
  chain.push(google(PRIMARY_MODEL));
  if (process.env.GROQ_API_KEY) chain.push(groq(FALLBACK_MODEL));
  return chain.length === 1 ? chain[0] : withFallback(chain);
}

/**
 * gpt-5 family: "low" effort, not "minimal" — at minimal, nano narrates
 * components as markdown, ignores the tool mapping and chats with off-topic
 * requests. Low keeps it cheap while restoring instruction-following.
 */
export function openaiProviderOptions():
  | { reasoningEffort: "low" }
  | undefined {
  return process.env.OPENAI_API_KEY && OPENAI_MODEL.startsWith("gpt-5")
    ? { reasoningEffort: "low" }
    : undefined;
}
