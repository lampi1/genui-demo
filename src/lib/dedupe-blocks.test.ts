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

  it("keeps text alongside compositions when no contact card rendered", () => {
    const parts: Parts = [
      { type: "text", text: "framing line" } as Parts[number],
      composition([{ type: "stats" }]),
    ];
    expect(dedupeGeneratedBlocks(parts)).toHaveLength(2);
  });

  it("makes a completed contact card the ENTIRE answer", () => {
    // Owner's rule (2026-07-12): who-made-this shows the card and nothing else.
    const contact = {
      type: "tool-show_contact",
      state: "output-available",
    } as unknown as Parts[number];
    const parts: Parts = [
      { type: "text", text: "Here is the maker" } as Parts[number],
      contact,
      composition([{ type: "actions" }]),
    ];
    expect(dedupeGeneratedBlocks(parts)).toEqual([contact]);
  });

  it("leaves the message alone while the contact card is still streaming", () => {
    const parts: Parts = [
      {
        type: "tool-show_contact",
        state: "input-streaming",
      } as unknown as Parts[number],
      { type: "text", text: "framing" } as Parts[number],
    ];
    expect(dedupeGeneratedBlocks(parts)).toHaveLength(2);
  });
});
