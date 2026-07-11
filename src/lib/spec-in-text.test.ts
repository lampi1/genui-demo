import { describe, expect, it } from "vitest";
import { splitSpecFences, stripComponentNarration } from "./spec-in-text";

describe("stripComponentNarration", () => {
  it("removes markdown outlines and badge labels, keeps framing sentences", () => {
    const stripped = stripComponentNarration(
      "Here are the trade-offs, side-by-side.\n\nTrade-offs by design approach\n- Tool-calling components\n  - Reliable pixel-perfect rendering\nStep 1 — User asks a question\nComposed live by AI\n\nTry a form next.",
    );
    expect(stripped).toBe(
      "Here are the trade-offs, side-by-side.\n\nTrade-offs by design approach\n\nTry a form next.",
    );
  });
});

const SPEC_JSON = JSON.stringify({
  children: [
    {
      type: "card",
      title: "Curiosità",
      children: [{ type: "text", content: "Ciao." }],
    },
  ],
});

describe("splitSpecFences", () => {
  it("passes plain text through untouched", () => {
    expect(splitSpecFences("Just words.", false)).toEqual([
      { kind: "text", text: "Just words." },
    ]);
  });

  it("turns a fenced spec into a renderable segment, keeping surrounding prose", () => {
    const segments = splitSpecFences(
      `Ecco uno spaccato.\n\n\`\`\`json\n${SPEC_JSON}\n\`\`\`\n\nProva un timeline.`,
      false,
    );
    expect(segments.map((segment) => segment.kind)).toEqual(["text", "spec", "text"]);
  });

  it("hides fenced JSON that cannot become UI", () => {
    const segments = splitSpecFences('```json\n{"hello": 1}\n```', false);
    expect(segments).toEqual([]);
  });

  it("still renders fenced non-JSON as a code snippet", () => {
    const segments = splitSpecFences("```\nconst x = 1;\n```", false);
    expect(segments).toEqual([{ kind: "code", raw: "const x = 1;" }]);
  });

  it("hides a half-streamed fence behind a pending block", () => {
    const segments = splitSpecFences(
      'Ecco:\n```json\n{"children": [',
      true,
    );
    expect(segments.map((segment) => segment.kind)).toEqual(["text", "pending"]);
  });

  it("unwraps a sentence trapped in a JSON envelope", () => {
    const segments = splitSpecFences(
      '{"error": "This interface renders UI blocks, not prose."}',
      false,
    );
    expect(segments).toEqual([
      { kind: "text", text: "This interface renders UI blocks, not prose." },
    ]);
  });

  it("salvages a whole-message bare JSON spec", () => {
    expect(splitSpecFences(SPEC_JSON, false)[0].kind).toBe("spec");
    expect(splitSpecFences(SPEC_JSON.slice(0, 40), true)[0].kind).toBe("pending");
  });

  it("salvages a bare node pasted after prose", () => {
    // Observed live (2026-07-11): the model typed its actions node as text.
    const segments = splitSpecFences(
      'Keep exploring.\n\n{"type":"actions","buttons":[{"label":"Try the form"},{"label":"Surprise layout"}]}',
      false,
    );
    expect(segments.map((segment) => segment.kind)).toEqual(["text", "spec"]);
  });

  it("salvages a whole-message bare node", () => {
    const segments = splitSpecFences(
      '{"type":"actions","buttons":[{"label":"Try the form"}]}',
      false,
    );
    expect(segments.map((segment) => segment.kind)).toEqual(["spec"]);
  });

  it("hides a half-streamed bare node behind a pending block", () => {
    const segments = splitSpecFences(
      'Keep exploring.\n\n{"type":"actions","buttons":[{"label":"Try',
      true,
    );
    expect(segments.map((segment) => segment.kind)).toEqual(["text", "pending"]);
  });

  it("salvages a whole spec pasted after prose", () => {
    const segments = splitSpecFences(`Ecco.\n\n${SPEC_JSON}`, false);
    expect(segments.map((segment) => segment.kind)).toEqual(["text", "spec"]);
  });

  it("hides any trailing unclosed brace while streaming", () => {
    const segments = splitSpecFences("Ecco la composizione:\n\n{", true);
    expect(segments.map((segment) => segment.kind)).toEqual(["text", "pending"]);
  });

  it("leaves braces that are not a renderable node as prose", () => {
    const segments = splitSpecFences(
      'A node looks like {"type":"mystery_widget"} in spirit.',
      false,
    );
    expect(segments).toEqual([
      { kind: "text", text: 'A node looks like {"type":"mystery_widget"} in spirit.' },
    ]);
  });
});
