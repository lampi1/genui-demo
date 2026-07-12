import { afterEach, describe, expect, it, vi } from "vitest";
import type { LanguageModelV4 } from "@ai-sdk/provider";
import { buildChatModel, isRateLimitError, withFallback } from "./model";

function fakeModel(
  id: string,
  behavior: () => Promise<string>,
): LanguageModelV4 {
  return {
    specificationVersion: "v4",
    provider: "fake",
    modelId: id,
    supportedUrls: {},
    doGenerate: behavior as never,
    doStream: behavior as never,
  };
}

const rateLimit = () =>
  Promise.reject(
    Object.assign(new Error("You exceeded your current quota"), {
      statusCode: 429,
    }),
  );

describe("isRateLimitError", () => {
  it("recognizes 429s and quota messages, not ordinary errors", () => {
    expect(isRateLimitError({ statusCode: 429 })).toBe(true);
    expect(isRateLimitError(new Error("high demand, try later"))).toBe(true);
    expect(isRateLimitError(new Error("invalid api key"))).toBe(false);
  });
});

describe("buildChatModel", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("puts the paid OpenAI model first, the free tiers behind it", () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("GROQ_API_KEY", "test-key");
    expect(buildChatModel().modelId).toBe(
      "gpt-5-nano -> gemini-flash-lite-latest -> llama-3.3-70b-versatile",
    );
  });

  it("leads with Gemini when no OpenAI key is configured", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("GROQ_API_KEY", "");
    expect(buildChatModel().modelId).toBe("gemini-flash-lite-latest");
  });
});

describe("withFallback", () => {
  it("switches to the next provider on rate limits", async () => {
    const chain = withFallback([
      fakeModel("primary", rateLimit),
      fakeModel("backup", () => Promise.resolve("served-by-backup")),
    ]);
    await expect(chain.doStream({} as never)).resolves.toBe("served-by-backup");
  });

  it("propagates non-capacity errors from the primary immediately", async () => {
    const chain = withFallback([
      fakeModel("primary", () => Promise.reject(new Error("invalid api key"))),
      fakeModel("backup", () => Promise.resolve("never")),
    ]);
    await expect(chain.doStream({} as never)).rejects.toThrow("invalid api key");
  });

  it("rethrows the last rate limit when every provider is saturated", async () => {
    const chain = withFallback([
      fakeModel("primary", rateLimit),
      fakeModel("backup", rateLimit),
    ]);
    await expect(chain.doStream({} as never)).rejects.toThrow("quota");
  });
});
