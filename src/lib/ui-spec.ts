import { z } from "zod";

/**
 * UI spec — the declarative JSON tree the model emits for free composition
 * (see CONTEXT.md: "UI spec", "Allow-list", "Renderer").
 *
 * The schema is intentionally non-recursive: containers are unrolled to a
 * bounded depth (3 levels) so the tool schema stays friendly to Gemini's
 * structured output, and a runaway model can never nest indefinitely.
 */
export const ALLOWED_COMPONENTS = [
  "stack",
  "card",
  "text",
  "list",
  "comparison",
  "timeline",
  "accordion",
  "tabs",
  "stats",
  "code",
  "form",
  "actions",
  "chart",
  "progress",
  "callout",
  "chips",
  "table",
  "links",
  "quiz",
  "flow",
  "flipcards",
  "gauge",
] as const;

/** Domains a model-emitted link may point to — anything else is dropped. */
export const LINK_ALLOWED_DOMAINS = [
  "arxiv.org",
  "ai.google.dev",
  "developers.googleblog.com",
  "docs.ag-ui.com",
  "ag-ui.com",
  "ai-sdk.dev",
  "vercel.com",
  "modelcontextprotocol.io",
  "generativeui.github.io",
  "linkedin.com",
] as const;

export function isAllowedLinkUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:") return false;
    return LINK_ALLOWED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

export type AllowedComponent = (typeof ALLOWED_COMPONENTS)[number];

export function isAllowedComponent(type: string): type is AllowedComponent {
  return (ALLOWED_COMPONENTS as readonly string[]).includes(type);
}

// --- Leaf nodes -----------------------------------------------------------

const textNode = z.object({
  type: z.literal("text"),
  content: z
    .string()
    // JSON does not belong in prose: rejecting it here routes the node
    // through the repair pass, which re-parses or drops it.
    .refine((content) => !/^\s*\{\s*"/.test(content), "JSON is not text")
    .describe("Plain text. No markdown syntax."),
  variant: z
    .enum(["display", "lead", "body", "caption", "code"])
    .optional()
    .describe(
      "display = one big gradient headline, lead = large intro line, caption = small muted, code = monospace",
    ),
});

const listNode = z.object({
  type: z.literal("list"),
  ordered: z.boolean().optional(),
  items: z.array(z.string()).min(1).max(8),
});

const comparisonNode = z.object({
  type: z.literal("comparison"),
  columns: z
    .array(
      z.object({
        title: z.string(),
        points: z.array(z.string()).min(1).max(6),
      }),
    )
    .min(2)
    .max(3)
    .describe("Side-by-side comparison of 2-3 alternatives."),
});

const timelineNode = z.object({
  type: z.literal("timeline"),
  items: z
    .array(
      z.object({
        label: z.string().optional().describe("Short marker, e.g. a year or step number"),
        title: z.string(),
        description: z.string().optional(),
      }),
    )
    .min(2)
    .max(6),
});

const accordionNode = z.object({
  type: z.literal("accordion"),
  items: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      }),
    )
    .min(2)
    .max(6)
    .describe("Expandable sections — great for details, FAQs, deep dives."),
});

const tabsNode = z.object({
  type: z.literal("tabs"),
  tabs: z
    .array(
      z.object({
        label: z.string(),
        content: z.string(),
      }),
    )
    .min(2)
    .max(4)
    .describe("Switchable panels — great for alternatives and perspectives."),
});

const statsNode = z.object({
  type: z.literal("stats"),
  items: z
    .array(
      z.object({
        value: z.number().describe("The number itself; it animates counting up"),
        label: z.string(),
        prefix: z.string().optional().describe("e.g. '$', '~'"),
        suffix: z.string().optional().describe("e.g. '%', 'ms', 'req/day'"),
      }),
    )
    .min(1)
    .max(4),
});

const codeNode = z.object({
  type: z.literal("code"),
  language: z.string().optional(),
  content: z.string().describe("The code snippet, plain text"),
});

const formNode = z.object({
  type: z.literal("form"),
  title: z.string(),
  description: z.string().optional(),
  submitLabel: z.string().optional(),
  fields: z
    .array(
      z.object({
        label: z.string(),
        type: z.enum(["text", "textarea", "select", "radio"]).optional(),
        placeholder: z.string().optional(),
        options: z.array(z.string()).max(6).optional(),
      }),
    )
    .min(1)
    .max(5)
    .describe("The visitor's answers come back as their next chat message."),
});

const actionsNode = z.object({
  type: z.literal("actions"),
  buttons: z
    .array(
      z.object({
        // Empty labels render nothing tappable — reject them so the repair
        // pass drops the button (and a buttonless block) instead.
        label: z.string().min(1),
        message: z
          .string()
          .optional()
          .describe("Chat message sent on tap; defaults to the label"),
      }),
    )
    .min(1)
    .max(4)
    .describe("Tappable follow-ups that continue the conversation."),
});

const chartNode = z.object({
  type: z.literal("chart"),
  kind: z.enum(["bar", "donut", "line"]).optional().describe("default bar"),
  title: z.string().optional(),
  suffix: z.string().optional().describe("unit, e.g. '%'"),
  data: z
    .array(z.object({ label: z.string(), value: z.number() }))
    .min(2)
    .max(8),
});

const progressNode = z.object({
  type: z.literal("progress"),
  items: z
    .array(
      z.object({
        label: z.string(),
        value: z.number().describe("0-100"),
      }),
    )
    .min(1)
    .max(6),
});

const calloutNode = z.object({
  type: z.literal("callout"),
  tone: z.enum(["info", "tip", "warning"]).optional(),
  title: z.string().optional(),
  content: z.string(),
});

const chipsNode = z.object({
  type: z.literal("chips"),
  items: z.array(z.string()).min(2).max(10),
});

const tableNode = z.object({
  type: z.literal("table"),
  columns: z.array(z.string()).min(2).max(4),
  rows: z.array(z.array(z.string()).min(1).max(4)).min(1).max(8),
});

const linksNode = z.object({
  type: z.literal("links"),
  items: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().refine(isAllowedLinkUrl, "domain not allow-listed"),
        note: z.string().optional().describe("one-line description"),
      }),
    )
    .min(1)
    .max(5)
    .describe("Official resources/papers only — real URLs from the knowledge."),
});

const quizNode = z.object({
  type: z.literal("quiz"),
  question: z.string(),
  options: z
    .array(
      z.object({
        label: z.string().min(1),
        correct: z.boolean().optional(),
        reaction: z
          .string()
          .optional()
          .describe("One witty line shown when this option is picked"),
      }),
    )
    .min(2)
    .max(4)
    .refine(
      (options) => options.filter((option) => option.correct).length === 1,
      "exactly one option must have correct:true",
    ),
  explanation: z.string().optional().describe("Shown after the visitor answers"),
});

const flowNode = z.object({
  type: z.literal("flow"),
  title: z.string().optional(),
  steps: z
    .array(
      z.object({
        label: z.string().min(1),
        detail: z.string().optional().describe("One short line under the step"),
      }),
    )
    .min(2)
    .max(6)
    .describe("A left-to-right flow diagram: each step becomes a box, arrows join them."),
});

const flipcardsNode = z.object({
  type: z.literal("flipcards"),
  cards: z
    .array(
      z.object({
        front: z.string().min(1).describe("The teaser face: a term, a question, a myth"),
        back: z.string().min(1).describe("The payoff revealed on flip"),
      }),
    )
    .min(2)
    .max(4)
    .describe("A grid of cards that flip on tap — fronts tease, backs reveal."),
});

const gaugeNode = z.object({
  type: z.literal("gauge"),
  items: z
    .array(
      z.object({
        label: z.string(),
        value: z.number().describe("0-100"),
        suffix: z.string().optional().describe("unit after the number, e.g. '%'"),
      }),
    )
    .min(1)
    .max(3)
    .describe("Radial dials that sweep to their value — scores, ratings, maturity."),
});

const leafNode = z.discriminatedUnion("type", [
  textNode,
  listNode,
  comparisonNode,
  timelineNode,
  accordionNode,
  tabsNode,
  statsNode,
  codeNode,
  formNode,
  actionsNode,
  chartNode,
  progressNode,
  calloutNode,
  chipsNode,
  tableNode,
  linksNode,
  quizNode,
  flowNode,
  flipcardsNode,
  gaugeNode,
]);

// --- Containers, unrolled to a bounded depth ------------------------------

const accent = z
  .enum(["violet", "cyan", "rose", "none"])
  .optional()
  .describe("Optional color accent for the card edge");

function cardOf<T extends z.ZodType>(children: T) {
  return z.object({
    type: z.literal("card"),
    title: z.string().optional(),
    accent,
    children: z.array(children).min(1).max(8),
  });
}

function stackOf<T extends z.ZodType>(children: T) {
  return z.object({
    type: z.literal("stack"),
    direction: z
      .enum(["vertical", "horizontal"])
      .optional()
      .describe("horizontal wraps into columns on wide screens, stacks on mobile"),
    children: z.array(children).min(1).max(8),
  });
}

const level2Node = z.discriminatedUnion("type", [
  ...leafNode.options,
  cardOf(leafNode),
  stackOf(leafNode),
]);

const level1Node = z.discriminatedUnion("type", [
  ...leafNode.options,
  cardOf(level2Node),
  stackOf(level2Node),
]);

export const uiSpecSchema = z
  .object({
    children: z.array(level1Node).min(1).max(10),
  })
  .describe(
    "A small interface composed from allow-listed building blocks. Keep it compact.",
  );

export type UiSpec = z.infer<typeof uiSpecSchema>;
export type UiNode = z.infer<typeof level1Node> | z.infer<typeof leafNode>;

/**
 * Repair the node-shape confusions models actually make (observed live):
 * `text` with `title`/`text` instead of `content`, and `list` carrying
 * timeline-shaped items. Purely structural — nothing outside the allow-list
 * can survive, because the result still goes through the schema.
 */
export function repairUiSpecValue(value: unknown): unknown {
  if (typeof value !== "object" || value === null) return value;
  if (Array.isArray(value)) return value.map(repairUiSpecValue);

  const node = { ...(value as Record<string, unknown>) };

  // Wrapper tic (observed live): the node's type used as its only key —
  // {"card": {...}} instead of {"type": "card", ...}. Unwrap to the flat shape.
  if (typeof node.type !== "string") {
    const wrapperKey = Object.keys(node).find(
      (key) =>
        isAllowedComponent(key) &&
        typeof node[key] === "object" &&
        node[key] !== null &&
        !Array.isArray(node[key]),
    );
    if (wrapperKey) {
      const inner = node[wrapperKey] as Record<string, unknown>;
      delete node[wrapperKey];
      Object.assign(node, inner);
      if (typeof node.type !== "string") node.type = wrapperKey;
    }
  }

  // A missing type is inferable from the shape (models omit it for "obvious" text).
  if (typeof node.type !== "string") {
    if (
      typeof node.content === "string" ||
      typeof node.text === "string" ||
      typeof node.title === "string"
    ) {
      node.type = "text";
    } else if (Array.isArray(node.tabs)) node.type = "tabs";
    else if (Array.isArray(node.buttons)) node.type = "actions";
    else if (Array.isArray(node.rows)) node.type = "table";
    else if (Array.isArray(node.data)) node.type = "chart";
    else if (Array.isArray(node.steps)) node.type = "flow";
    else if (Array.isArray(node.cards)) node.type = "flipcards";
    else if (Array.isArray(node.items)) node.type = "list";
    else if (Array.isArray(node.columns)) node.type = "comparison";
    else if (Array.isArray(node.children)) node.type = "stack";
  }

  // Collection aliases: the model parks the entries under the wrong key
  // ('content', 'children', 'items'…) — move them to the schema's field name.
  const COLLECTION_KEY: Record<string, string> = {
    accordion: "items",
    timeline: "items",
    stats: "items",
    list: "items",
    tabs: "tabs",
    form: "fields",
    comparison: "columns",
    actions: "buttons",
    chart: "data",
    progress: "items",
    chips: "items",
    table: "rows",
    links: "items",
    quiz: "options",
    flow: "steps",
    flipcards: "cards",
    gauge: "items",
  };
  const aliasTarget = COLLECTION_KEY[node.type as string];
  if (aliasTarget && !Array.isArray(node[aliasTarget])) {
    const donor = [
      "items",
      "content",
      "children",
      "fields",
      "tabs",
      "columns",
      "data",
      "buttons",
      "rows",
      "links",
      "options",
      "steps",
      "cards",
    ]
      .filter((key) => key !== aliasTarget)
      .find((key) => Array.isArray(node[key]));
    if (donor) {
      node[aliasTarget] = node[donor];
      delete node[donor];
    }
  }

  if (node.type === "accordion" && Array.isArray(node.items)) {
    node.items = node.items.map((item) => {
      if (typeof item !== "object" || item === null) return item;
      const entry = { ...(item as Record<string, unknown>) };
      if (typeof entry.content !== "string" && typeof entry.description === "string") {
        entry.content = entry.description;
        delete entry.description;
      }
      return entry;
    });
  }

  if (node.type === "form") {
    if (Array.isArray(node.fields)) {
      node.fields = node.fields.map((field) => {
        if (typeof field !== "object" || field === null) return field;
        const entry = { ...(field as Record<string, unknown>) };
        if (typeof entry.label !== "string" && typeof entry.title === "string") {
          entry.label = entry.title;
          delete entry.title;
        }
        const kinds = ["text", "textarea", "select", "radio"];
        if ("type" in entry && !kinds.includes(entry.type as string)) delete entry.type;
        return entry;
      });
    }
  }

  // Actions arrive in every broken shape small models invent: buttons as
  // plain strings, labels under title/text, or no buttons at all. Salvage
  // whatever has a label; a buttonless actions block is dropped — it must
  // never sink an otherwise healthy spec.
  if (node.type === "actions") {
    if (!Array.isArray(node.buttons)) return null;
    const buttons = node.buttons
      .map((button) => {
        if (typeof button === "string") {
          return button.trim() ? { label: button } : null;
        }
        if (typeof button !== "object" || button === null) return null;
        const entry = { ...(button as Record<string, unknown>) };
        if (typeof entry.label !== "string" || entry.label.trim() === "") {
          const alias = [entry.title, entry.text].find(
            (candidate) => typeof candidate === "string" && candidate.trim() !== "",
          );
          if (alias) entry.label = alias;
        }
        return typeof entry.label === "string" && entry.label.trim() !== ""
          ? entry
          : null;
      })
      .filter((button) => button !== null);
    if (buttons.length === 0) return null;
    node.buttons = buttons.slice(0, 4);
  }

  // Quiz options: strings become labels; more than one "correct" keeps only
  // the first (zero stays zero — the schema's teaching error handles that).
  if (node.type === "quiz" && Array.isArray(node.options)) {
    let correctSeen = false;
    node.options = node.options
      .map((option) => {
        if (typeof option === "string") {
          return option.trim() ? { label: option } : null;
        }
        if (typeof option !== "object" || option === null) return null;
        const entry = { ...(option as Record<string, unknown>) };
        if (typeof entry.label !== "string" && typeof entry.text === "string") {
          entry.label = entry.text;
          delete entry.text;
        }
        if (entry.correct === true) {
          if (correctSeen) delete entry.correct;
          correctSeen = true;
        } else if ("correct" in entry && entry.correct !== true) {
          delete entry.correct;
        }
        return typeof entry.label === "string" && entry.label.trim() !== ""
          ? entry
          : null;
      })
      .filter((option) => option !== null);
  }

  // Flow steps: strings become labels; title/text aliases become labels too.
  if (node.type === "flow" && Array.isArray(node.steps)) {
    node.steps = node.steps
      .map((step) => {
        if (typeof step === "string") return step.trim() ? { label: step } : null;
        if (typeof step !== "object" || step === null) return null;
        const entry = { ...(step as Record<string, unknown>) };
        if (typeof entry.label !== "string") {
          const alias = [entry.title, entry.text, entry.content].find(
            (candidate) => typeof candidate === "string" && candidate.trim() !== "",
          );
          if (alias) entry.label = alias;
        }
        if (typeof entry.detail !== "string" && typeof entry.description === "string") {
          entry.detail = entry.description;
          delete entry.description;
        }
        return typeof entry.label === "string" && entry.label.trim() !== ""
          ? entry
          : null;
      })
      .filter((step) => step !== null);
  }

  // Flip cards: front/back arrive under every near-synonym small models use.
  if (node.type === "flipcards" && Array.isArray(node.cards)) {
    node.cards = node.cards
      .map((card) => {
        if (typeof card !== "object" || card === null) return null;
        const entry = { ...(card as Record<string, unknown>) };
        if (typeof entry.front !== "string" || entry.front.trim() === "") {
          const alias = [entry.title, entry.label, entry.term, entry.question].find(
            (candidate) => typeof candidate === "string" && candidate.trim() !== "",
          );
          if (alias) entry.front = alias;
        }
        if (typeof entry.back !== "string" || entry.back.trim() === "") {
          const alias = [
            entry.content,
            entry.description,
            entry.detail,
            entry.answer,
            entry.text,
          ].find((candidate) => typeof candidate === "string" && candidate.trim() !== "");
          if (alias) entry.back = alias;
        }
        return typeof entry.front === "string" &&
          entry.front.trim() !== "" &&
          typeof entry.back === "string" &&
          entry.back.trim() !== ""
          ? { front: entry.front, back: entry.back }
          : null;
      })
      .filter((card) => card !== null);
  }

  if (node.type === "tabs" && Array.isArray(node.tabs)) {
    node.tabs = node.tabs.map((tab) => {
      if (typeof tab !== "object" || tab === null) return tab;
      const entry = { ...(tab as Record<string, unknown>) };
      if (typeof entry.label !== "string" && typeof entry.title === "string") {
        entry.label = entry.title;
        delete entry.title;
      }
      return entry;
    });
  }

  // Unknown node types get salvaged, never sink the spec: containers become
  // stacks, texty things become text, anything else is dropped by the parent.
  // Types with executable/embed intent are always dropped, never salvaged.
  const NEVER_SALVAGE = ["script", "style", "iframe", "html", "embed", "object", "svg"];
  if (typeof node.type === "string" && !isAllowedComponent(node.type)) {
    if (NEVER_SALVAGE.includes(node.type)) return null;
    if (Array.isArray(node.children)) node.type = "stack";
    else if (
      [node.content, node.text, node.title].some((v) => typeof v === "string")
    ) {
      node.type = "text";
    } else {
      return null;
    }
  }

  // Enums are style hints — an out-of-enum value must not sink the spec.
  const enums: Record<string, readonly string[]> = {
    variant: ["display", "lead", "body", "caption", "code"],
    accent: ["violet", "cyan", "rose", "none"],
    direction: ["vertical", "horizontal"],
    kind: ["bar", "donut", "line"],
    tone: ["info", "tip", "warning"],
  };
  for (const [key, allowed] of Object.entries(enums)) {
    if (key in node && !allowed.includes(node[key] as string)) delete node[key];
  }

  if (node.type === "text" && typeof node.content !== "string") {
    const fallback = node.title ?? node.text;
    if (typeof fallback === "string") node.content = fallback;
    delete node.title;
    delete node.text;
  }

  // JSON pasted INSIDE a text node's content (the model quoting a shape
  // instead of composing it): parse it into a real node, or drop it —
  // visitors never read raw JSON. A code-variant text keeps its JSON, but
  // as a proper code block.
  if (
    node.type === "text" &&
    typeof node.content === "string" &&
    /^\s*\{\s*"/.test(node.content)
  ) {
    if (node.variant === "code") {
      return { type: "code", language: "json", content: node.content };
    }
    try {
      return repairUiSpecValue(JSON.parse(node.content));
    } catch {
      return null;
    }
  }


  // Numeric collections (chart data, progress/gauge items) get the same
  // treatment as stats: coerce numeric strings, drop what never becomes a
  // number; percentage-shaped values clamp into 0-100.
  for (const [numericType, key] of [
    ["chart", "data"],
    ["progress", "items"],
    ["gauge", "items"],
  ] as const) {
    if (node.type === numericType && Array.isArray(node[key])) {
      node[key] = (node[key] as unknown[])
        .map((item) => {
          if (typeof item !== "object" || item === null) return item;
          const entry = { ...(item as Record<string, unknown>) };
          if (typeof entry.value === "string" && /\d/.test(entry.value)) {
            const numeric = Number(entry.value.replace(/[^\d.-]/g, ""));
            if (Number.isFinite(numeric)) entry.value = numeric;
          }
          if (numericType !== "chart" && typeof entry.value === "number") {
            entry.value = Math.max(0, Math.min(100, entry.value));
          }
          return entry;
        })
        .filter(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            Number.isFinite((item as Record<string, unknown>).value),
        );
    }
  }

  // Links outside the domain allow-list are dropped, never rendered.
  if (node.type === "links" && Array.isArray(node.items)) {
    node.items = node.items.filter(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).url === "string" &&
        isAllowedLinkUrl((item as Record<string, unknown>).url as string),
    );
  }

  if (node.type === "stats" && Array.isArray(node.items)) {
    node.items = node.items
      .map((item) => {
        if (typeof item !== "object" || item === null) return item;
        const stat = { ...(item as Record<string, unknown>) };
        if (typeof stat.value === "string" && /\d/.test(stat.value)) {
          const numeric = Number(stat.value.replace(/[^\d.-]/g, ""));
          if (Number.isFinite(numeric)) stat.value = numeric;
        }
        return stat;
      })
      // A stat whose value never becomes a number ("Basso") can't count up —
      // drop the tile instead of sinking the whole spec.
      .filter(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          Number.isFinite((item as Record<string, unknown>).value),
      );
  }

  if (node.type === "list" && Array.isArray(node.items)) {
    const objectItems = node.items.every(
      (item) => typeof item === "object" && item !== null && "title" in item,
    );
    const accordionItems =
      objectItems &&
      node.items.every((item) => typeof (item as Record<string, unknown>).content === "string");
    if (accordionItems && node.items.length >= 2) {
      node.type = "accordion";
      delete node.ordered;
    } else if (objectItems && node.items.length >= 2) {
      node.type = "timeline";
      delete node.ordered;
    } else {
      node.items = node.items.map((item) =>
        typeof item === "string"
          ? item
          : [
              (item as Record<string, unknown>).title,
              (item as Record<string, unknown>).description,
            ]
              .filter((part) => typeof part === "string")
              .join(" — "),
      );
    }
  }

  // A collection node without its collection (e.g. a header-only accordion)
  // downgrades to text instead of sinking the whole spec.
  const collectionOf: Record<string, string> = {
    accordion: "items",
    timeline: "items",
    stats: "items",
    list: "items",
    tabs: "tabs",
    comparison: "columns",
    form: "fields",
    quiz: "options",
    flow: "steps",
    flipcards: "cards",
    gauge: "items",
  };
  const collectionKey = collectionOf[node.type as string];
  if (collectionKey) {
    const collection = node[collectionKey];
    if (!Array.isArray(collection) || collection.length === 0) {
      const fallback = [node.title, node.question, node.content, node.description].find(
        (candidate) => typeof candidate === "string",
      );
      // Husk node (a type and nothing else): drop it, don't sink the spec.
      return fallback ? { type: "text", content: fallback, variant: "lead" } : null;
    }
    // Below the schema minimum (accordion/tabs/timeline want 2+): merge the
    // lone entry into a text line rather than fail.
    if (
      collection.length === 1 &&
      ["accordion", "tabs", "timeline", "flow", "flipcards"].includes(node.type as string)
    ) {
      const only = collection[0] as Record<string, unknown>;
      const label = [only?.title, only?.label, only?.front].find(
        (v) => typeof v === "string",
      );
      const body = [only?.content, only?.description, only?.detail, only?.back].find(
        (v) => typeof v === "string",
      );
      const merged = [label, body].filter(Boolean).join(" — ");
      if (merged) return { type: "text", content: merged };
    }
    // Above the maximum: trim, never reject.
    const maxOf: Record<string, number> = {
      accordion: 6,
      timeline: 6,
      stats: 4,
      list: 8,
      tabs: 4,
      comparison: 3,
      form: 5,
      actions: 4,
      chart: 8,
      progress: 6,
      chips: 10,
      table: 8,
      links: 5,
      quiz: 4,
      flow: 6,
      flipcards: 4,
      gauge: 3,
    };
    const max = maxOf[node.type as string];
    if (collection.length > max) node[collectionKey] = collection.slice(0, max);
  }

  // Recurse into child NODES only — items/columns hold plain data objects,
  // and node repair (type inference, enum drops) must not touch those.
  if (Array.isArray(node.children)) {
    node.children = node.children
      .map(repairUiSpecValue)
      .filter((child) => child !== null)
      .slice(0, 8);
  }

  // Remaining husks: a node that never earned a type (observed live as
  // {"":""}), a text without words or a container without children renders
  // nothing — drop the node instead of failing the whole spec.
  if (typeof node.type !== "string") return null;
  if (node.type === "text" && typeof node.content !== "string") return null;
  if (
    (node.type === "card" || node.type === "stack") &&
    (!Array.isArray(node.children) || node.children.length === 0)
  ) {
    return typeof node.title === "string"
      ? { type: "text", content: node.title, variant: "lead" }
      : null;
  }

  return node;
}

/** Validate an untrusted spec, repairing known near-misses; null when hopeless. */
export function parseUiSpec(value: unknown): UiSpec | null {
  const strict = uiSpecSchema.safeParse(value);
  if (strict.success) return strict.data;

  const repaired = uiSpecSchema.safeParse(repairUiSpecValue(value));
  return repaired.success ? repaired.data : null;
}
