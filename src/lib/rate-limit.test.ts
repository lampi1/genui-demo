import { describe, expect, it } from "vitest";
import {
  RATE_MAX_INTERACTIONS,
  RATE_WINDOW_MS,
  retryAfterSeconds,
} from "./rate-limit";

describe("retryAfterSeconds", () => {
  it("allows the full budget, then refuses with the time to the next slot", () => {
    const log = new Map<string, number[]>();
    const start = 1_000_000;
    for (let i = 0; i < RATE_MAX_INTERACTIONS; i++) {
      expect(retryAfterSeconds(log, "a", start + i * 1000)).toBe(0);
    }
    // 16th interaction: refused until the FIRST one rolls out of the window.
    const refusedAt = start + 20_000;
    const wait = retryAfterSeconds(log, "a", refusedAt);
    expect(wait).toBe(Math.ceil((start + RATE_WINDOW_MS - refusedAt) / 1000));
  });

  it("unblocks once the window rolls past the oldest interaction", () => {
    const log = new Map<string, number[]>();
    const start = 1_000_000;
    for (let i = 0; i < RATE_MAX_INTERACTIONS; i++) {
      retryAfterSeconds(log, "a", start + i * 1000);
    }
    expect(retryAfterSeconds(log, "a", start + RATE_WINDOW_MS + 1)).toBe(0);
  });

  it("tracks budgets per IP independently", () => {
    const log = new Map<string, number[]>();
    const now = 1_000_000;
    for (let i = 0; i < RATE_MAX_INTERACTIONS; i++) {
      retryAfterSeconds(log, "a", now + i);
    }
    expect(retryAfterSeconds(log, "a", now + 100)).toBeGreaterThan(0);
    expect(retryAfterSeconds(log, "b", now + 100)).toBe(0);
  });
});
