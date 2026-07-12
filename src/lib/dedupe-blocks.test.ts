import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import { dedupeGeneratedBlocks } from "./dedupe-blocks";

type Parts = UIMessage["parts"];

const composition = (children: { type: string }[], state = "output-available") =>
  ({
    type: "tool-render_ui",
    state,
    output: { children },
  }) as unknown as Parts[number];

describe("dedupeGeneratedBlocks", () => {
  it("keeps only the LAST completed content composition (re-issued answers)", () => {
    // Observed live (2026-07-12): the model re-issues the whole composition,
    // lightly reworded — the visitor saw the same answer twice.
    const parts: Parts = [
      composition([{ type: "concept" }, { type: "actions" }]),
      composition([{ type: "concept" }, { type: "actions" }]),
    ];
    expect(dedupeGeneratedBlocks(parts)).toHaveLength(1);
  });

  it("keeps a content composition AND its actions-only follow-up", () => {
    const parts: Parts = [
      composition([{ type: "chart" }]),
      composition([{ type: "actions" }]),
    ];
    expect(dedupeGeneratedBlocks(parts)).toHaveLength(2);
  });

  it("keeps streaming render_ui parts (they render nothing yet)", () => {
    const parts: Parts = [
      composition([{ type: "chart" }]),
      composition([{ type: "chart" }], "input-streaming"),
    ];
    expect(dedupeGeneratedBlocks(parts)).toHaveLength(2);
  });

  it("keeps text and the contact tool untouched", () => {
    const parts: Parts = [
      { type: "text", text: "framing line" } as Parts[number],
      { type: "tool-show_contact", state: "output-available" } as unknown as Parts[number],
      composition([{ type: "stats" }]),
    ];
    expect(dedupeGeneratedBlocks(parts)).toHaveLength(3);
  });
});
