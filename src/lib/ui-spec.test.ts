import { describe, expect, it } from "vitest";
import { isAllowedComponent, parseUiSpec } from "./ui-spec";

describe("isAllowedComponent", () => {
  it("accepts a type on the allow-list", () => {
    expect(isAllowedComponent("card")).toBe(true);
  });

  it("rejects a type outside the allow-list", () => {
    expect(isAllowedComponent("script")).toBe(false);
  });
});

describe("parseUiSpec", () => {
  it("accepts a compact valid spec", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "card",
          title: "Generative UI",
          accent: "violet",
          children: [
            { type: "text", content: "The model builds the interface.", variant: "lead" },
            { type: "list", items: ["tool-calling", "declarative spec"] },
          ],
        },
      ],
    });
    expect(spec).not.toBeNull();
    expect(spec?.children).toHaveLength(1);
  });

  it("drops a typeless husk node without sinking the spec", () => {
    // Observed live (2026-07-11): the model closed a composition with {"":""}.
    const spec = parseUiSpec({
      children: [{ type: "text", content: "real content" }, { "": "" }],
    });
    expect(spec?.children).toHaveLength(1);
  });

  it("salvages actions buttons sent as plain strings", () => {
    const spec = parseUiSpec({
      children: [
        { type: "text", content: "hi" },
        { type: "actions", buttons: ["Try the form", "Surprise layout"] },
      ],
    });
    expect(spec?.children[1]).toMatchObject({
      type: "actions",
      buttons: [{ label: "Try the form" }, { label: "Surprise layout" }],
    });
  });

  it("salvages actions buttons parked under children with a decoy empty fields", () => {
    // Observed live (2026-07-11).
    const spec = parseUiSpec({
      children: [
        { type: "text", content: "hi" },
        {
          type: "actions",
          submitLabel: "Next move",
          fields: [],
          children: [
            { type: "button", label: "Surprise me" },
            { type: "button", label: "Try the form" },
          ],
        },
      ],
    });
    expect((spec?.children[1] as { buttons?: unknown[] }).buttons).toHaveLength(2);
  });

  it("accepts a quiz with exactly one correct option", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "quiz",
          question: "What is generative UI?",
          options: [
            { label: "A UI that generates electricity", reaction: "Watt? No." },
            { label: "The model composes the interface itself", correct: true },
            { label: "A CSS framework from 2019" },
          ],
          explanation: "The model produces the interface, not just text.",
        },
      ],
    });
    expect(spec?.children[0]).toMatchObject({ type: "quiz" });
  });

  it("repairs a quiz with several correct flags down to one", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "quiz",
          question: "Pick one",
          options: [
            { label: "A", correct: true },
            { label: "B", correct: true },
          ],
        },
      ],
    });
    const quiz = spec?.children[0] as {
      options?: { correct?: boolean }[];
    };
    expect(quiz.options?.filter((option) => option.correct)).toHaveLength(1);
  });

  it("rejects a quiz with no correct option (teaching error path)", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "quiz",
          question: "Pick one",
          options: [{ label: "A" }, { label: "B" }],
        },
      ],
    });
    expect(spec).toBeNull();
  });

  it("unwraps nodes that use their type as a wrapper key", () => {
    // Observed live (2026-07-11): {"card": {...}} instead of {"type":"card"}.
    const spec = parseUiSpec({
      children: [
        { text: { content: "Surprise layout in motion", variant: "lead" } },
        {
          card: {
            type: "card",
            title: "Studio",
            children: [
              { chart: { kind: "donut", data: [{ label: "a", value: 1 }, { label: "b", value: 2 }] } },
            ],
          },
        },
      ],
    });
    expect(spec?.children[0]).toMatchObject({ type: "text", content: "Surprise layout in motion" });
    expect(spec?.children[1]).toMatchObject({ type: "card", title: "Studio" });
  });

  it("turns JSON quoted inside a text node into the real node", () => {
    const spec = parseUiSpec({
      children: [
        { type: "text", content: '{"type":"actions","buttons":[{"label":"Try the form"}]}' },
        { type: "text", content: "real words" },
      ],
    });
    expect(spec?.children[0]).toMatchObject({
      type: "actions",
      buttons: [{ label: "Try the form" }],
    });
  });

  it("drops a text node holding broken JSON without sinking the spec", () => {
    const spec = parseUiSpec({
      children: [
        { type: "text", content: '{"type":"actions","buttons":[' },
        { type: "text", content: "real words" },
      ],
    });
    expect(spec?.children).toHaveLength(1);
  });

  it("drops a buttonless actions block without sinking the spec", () => {
    const spec = parseUiSpec({
      children: [
        { type: "text", content: "hi" },
        { type: "actions", buttons: [{ label: "" }] },
      ],
    });
    expect(spec?.children).toHaveLength(1);
  });

  it("rejects a node type outside the allow-list", () => {
    const spec = parseUiSpec({
      children: [{ type: "script", content: "alert(1)" }],
    });
    expect(spec).toBeNull();
  });

  it("rejects nesting beyond the depth bound", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "card",
          children: [
            {
              type: "stack",
              children: [
                // level 3 must be a leaf — a container here is out of contract
                { type: "card", children: [{ type: "text", content: "too deep" }] },
              ],
            },
          ],
        },
      ],
    });
    expect(spec).toBeNull();
  });

  it("rejects an empty spec", () => {
    expect(parseUiSpec({ children: [] })).toBeNull();
    expect(parseUiSpec(null)).toBeNull();
  });

  // Near-miss shapes observed live from Gemini — repaired, not rejected.
  it("repairs a text node that carries title instead of content", () => {
    const spec = parseUiSpec({
      children: [{ type: "text", title: "Approaches to Generative UI" }],
    });
    expect(spec?.children[0]).toEqual({
      type: "text",
      content: "Approaches to Generative UI",
    });
  });

  it("repairs a list of {title, description} items into a timeline", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "list",
          items: [
            { title: "Tool-calling", description: "Curated components." },
            { title: "Declarative spec", description: "JSON tree." },
          ],
        },
      ],
    });
    expect(spec?.children[0].type).toBe("timeline");
  });

  it("drops out-of-enum style hints instead of failing", () => {
    const spec = parseUiSpec({
      children: [{ type: "text", content: "Bold claim.", variant: "strong" }],
    });
    expect(spec?.children[0]).toEqual({ type: "text", content: "Bold claim." });
  });

  it("infers a missing type from the node shape", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "card",
          children: [
            { variant: "h2", content: "1. Tool-calling" },
            { content: "Reliable and pixel-perfect.", variant: "body2" },
          ],
        },
      ],
    });
    expect(spec).not.toBeNull();
    const card = spec?.children[0];
    expect(card?.type === "card" && card.children[0]).toEqual({
      type: "text",
      content: "1. Tool-calling",
    });
  });

  it("accepts the interactive blocks", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "accordion",
          items: [
            { title: "A2UI", content: "Declarative payload." },
            { title: "AG-UI", content: "Event transport." },
          ],
        },
        {
          type: "tabs",
          tabs: [
            { label: "Pros", content: "Safe." },
            { label: "Cons", content: "Bounded." },
          ],
        },
        {
          type: "stats",
          items: [{ value: 1500, label: "free requests", suffix: "/day" }],
        },
        { type: "code", language: "ts", content: "tool({ inputSchema })" },
      ],
    });
    expect(spec?.children).toHaveLength(4);
  });

  it("repairs {title, content} list items into an accordion and numeric-string stats", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "list",
          items: [
            { title: "First", content: "Details." },
            { title: "Second", content: "More details." },
          ],
        },
        { type: "stats", items: [{ value: "1,500", label: "req/day" }] },
      ],
    });
    expect(spec?.children[0].type).toBe("accordion");
    expect(spec?.children[1]).toMatchObject({
      type: "stats",
      items: [{ value: 1500 }],
    });
  });

  it("drops stats tiles whose value is not numeric", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "stats",
          items: [
            { value: 2, label: "Weeks" },
            { value: "Basso", label: "Cost" },
          ],
        },
      ],
    });
    expect(spec?.children[0]).toMatchObject({
      type: "stats",
      items: [{ value: 2, label: "Weeks" }],
    });
  });

  it("repairs collection aliases: accordion content→items, tabs items with title→label", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "accordion",
          title: "Deep dive",
          content: [
            { title: "A2UI", content: "Payload." },
            { title: "AG-UI", content: "Transport." },
          ],
        },
        {
          type: "tabs",
          items: [
            { title: "Pros", content: "Safe." },
            { title: "Cons", content: "Bounded." },
          ],
        },
      ],
    });
    expect(spec?.children[0]).toMatchObject({
      type: "accordion",
      items: [{ title: "A2UI" }, { title: "AG-UI" }],
    });
    const accordionWithDescriptions = parseUiSpec({
      children: [
        {
          type: "accordion",
          content: [
            { title: "A2UI", description: "Payload." },
            { title: "AG-UI", description: "Transport." },
          ],
        },
      ],
    });
    expect(accordionWithDescriptions?.children[0]).toMatchObject({
      type: "accordion",
      items: [
        { title: "A2UI", content: "Payload." },
        { title: "AG-UI", content: "Transport." },
      ],
    });
    expect(spec?.children[1]).toMatchObject({
      type: "tabs",
      tabs: [{ label: "Pros" }, { label: "Cons" }],
    });
  });

  it("accepts a form node and repairs its field near-misses", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "form",
          title: "Which approach fits you?",
          items: [
            { title: "Project type", type: "dropdown", options: ["Web app", "CLI"] },
            { label: "Priority", options: ["Speed", "Flexibility"] },
          ],
        },
      ],
    });
    expect(spec?.children[0]).toMatchObject({
      type: "form",
      fields: [
        { label: "Project type", options: ["Web app", "CLI"] },
        { label: "Priority", options: ["Speed", "Flexibility"] },
      ],
    });
  });

  it("downgrades a header-only accordion to a lead text instead of failing", () => {
    const spec = parseUiSpec({
      children: [
        { title: "Emerging Standards", type: "accordion" },
        {
          type: "accordion",
          items: [
            { title: "A2UI", description: "Payload." },
            { title: "AG-UI", description: "Transport." },
          ],
        },
      ],
    });
    expect(spec?.children[0]).toEqual({
      type: "text",
      content: "Emerging Standards",
      variant: "lead",
    });
    expect(spec?.children[1].type).toBe("accordion");
  });

  it("merges a single-item accordion into text and trims oversized lists", () => {
    const spec = parseUiSpec({
      children: [
        { type: "accordion", items: [{ title: "Only", content: "One." }] },
        { type: "list", items: Array.from({ length: 12 }, (_, i) => `item ${i}`) },
      ],
    });
    expect(spec?.children[0]).toMatchObject({ type: "text", content: "Only — One." });
    expect(spec?.children[1]).toMatchObject({ type: "list" });
    expect(spec?.children[1].type === "list" && spec.children[1].items).toHaveLength(8);
  });

  it("repairs an accordion whose entries sit under 'children'", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "accordion",
          children: [
            { title: "What is it?", content: "Interfaces built by the model." },
            { title: "How this works", content: "Hybrid approach." },
          ],
        },
      ],
    });
    expect(spec?.children[0]).toMatchObject({
      type: "accordion",
      items: [{ title: "What is it?" }, { title: "How this works" }],
    });
  });

  it("salvages unknown node types: heading→text, grid→stack, junk dropped", () => {
    const spec = parseUiSpec({
      children: [
        { type: "heading", title: "Welcome" },
        {
          type: "grid",
          children: [
            { type: "text", content: "Real content." },
            { type: "iframe", src: "https://x" },
          ],
        },
      ],
    });
    expect(spec?.children[0]).toMatchObject({ type: "text", content: "Welcome" });
    expect(spec?.children[1]).toMatchObject({
      type: "stack",
      children: [{ type: "text", content: "Real content." }],
    });
  });

  it("drops husk nodes (type only, no content) and keeps the real ones", () => {
    const spec = parseUiSpec({
      children: [
        { type: "text" },
        { type: "card" },
        { type: "timeline" },
        { type: "text", content: "The only real node." },
      ],
    });
    expect(spec?.children).toEqual([
      { type: "text", content: "The only real node." },
    ]);
    // A spec made ONLY of husks has nothing left to render.
    expect(
      parseUiSpec({ children: [{ type: "text" }, { type: "form" }] }),
    ).toBeNull();
  });

  it("accepts the six new blocks and repairs their quirks", () => {
    const spec = parseUiSpec({
      children: [
        { type: "actions", buttons: [{ label: "Show me a chart" }] },
        {
          type: "chart",
          kind: "donut",
          items: [
            { label: "A2UI", value: "40%" },
            { label: "AG-UI", value: 35 },
            { label: "boh", value: "n/a" },
          ],
        },
        { type: "progress", items: [{ label: "Adoption", value: 140 }] },
        { type: "callout", tone: "hint", content: "Watch this." },
        { type: "chips", items: ["react", "zod"] },
        { type: "table", columns: ["Standard", "Layer"], rows: [["A2UI", "Payload"]] },
      ],
    });
    expect(spec?.children.map((node) => node.type)).toEqual([
      "actions",
      "chart",
      "progress",
      "callout",
      "chips",
      "table",
    ]);
    const chart = spec?.children[1];
    expect(chart?.type === "chart" && chart.data).toEqual([
      { label: "A2UI", value: 40 },
      { label: "AG-UI", value: 35 },
    ]);
    const progress = spec?.children[2];
    expect(progress?.type === "progress" && progress.items[0].value).toBe(100);
  });

  it("keeps only allow-listed link domains", () => {
    const spec = parseUiSpec({
      children: [
        {
          type: "links",
          items: [
            { label: "Paper", url: "https://arxiv.org/abs/2604.09577" },
            { label: "Evil", url: "https://phishing.example.com/x" },
            { label: "Plain", url: "http://arxiv.org/abs/1" },
          ],
        },
      ],
    });
    expect(spec?.children[0]).toMatchObject({
      type: "links",
      items: [{ url: "https://arxiv.org/abs/2604.09577" }],
    });
  });

  it("still rejects a spec with nothing salvageable", () => {
    expect(parseUiSpec({ children: [{ type: "iframe", src: "https://x" }] })).toBeNull();
  });
});
