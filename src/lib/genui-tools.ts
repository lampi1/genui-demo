import { z } from "zod";

/**
 * Since CH-001 (single declarative engine) only `contactInput` and
 * `renderUiInput` are tool inputs. The other schemas survive as the typed
 * props of the hand-crafted React components, which now render SPEC NODES
 * of the same shape (concept, comparison, timeline, form).
 */

export const conceptInput = z.object({
  title: z.string(),
  tagline: z.string().optional().describe("One striking line under the title"),
  points: z.array(z.string()).min(1).max(6).describe("Short, punchy statements"),
  accent: z.enum(["violet", "cyan", "rose"]).optional(),
});

export const comparisonInput = z.object({
  title: z.string().optional(),
  columns: z
    .array(
      z.object({
        title: z.string(),
        points: z.array(z.string()).min(1).max(6),
      }),
    )
    .min(2)
    .max(3),
});

export const timelineInput = z.object({
  title: z.string().optional(),
  items: z
    .array(
      z.object({
        label: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
      }),
    )
    .min(2)
    .max(6),
});

/** Contact facts live server-side (src/lib/content.ts); the model sends nothing. */
export const contactInput = z.object({});

export const formInput = z.object({
  title: z.string(),
  description: z.string().optional(),
  submitLabel: z.string().optional(),
  fields: z
    .array(
      z.object({
        label: z.string(),
        type: z
          .enum(["text", "textarea", "select", "radio"])
          .optional()
          .describe("Omit to infer: options present → radio, otherwise text"),
        placeholder: z.string().optional(),
        options: z.array(z.string()).max(6).optional(),
      }),
    )
    .min(1)
    .max(5),
});

/**
 * Deliberately loose: nested discriminated unions are beyond what Gemini's
 * function calling follows reliably, so the strict contract (allow-list,
 * depth bound) is enforced in the tool's execute via parseUiSpec — which
 * repairs near-misses and throws a teaching error on hopeless input.
 */
/**
 * The middle way, learned the hard way: a strict schema gets tool calls
 * REJECTED by Groq's server-side validation (no additional properties), an
 * empty loose one makes gpt-5-nano emit husk nodes with only a `type`. So:
 * every field declared (generation guidance) but optional and loose
 * (validation tolerance). The real contract stays in execute via parseUiSpec.
 */
const looseNode = z.looseObject({
  type: z.string().optional(),
  content: z.string().optional().describe("REQUIRED for text/code nodes — the actual words"),
  variant: z.string().optional(),
  title: z.string().optional(),
  accent: z.string().optional(),
  direction: z.string().optional(),
  language: z.string().optional(),
  ordered: z.boolean().optional(),
  description: z.string().optional(),
  submitLabel: z.string().optional(),
  items: z
    .array(z.unknown())
    .optional()
    .describe("REQUIRED for list/timeline/accordion/stats/gauge"),
  cards: z.array(z.unknown()).optional().describe("flipcards only: {front, back}"),
  points: z.array(z.unknown()).optional().describe("concept only: short strings"),
  tagline: z.string().optional().describe("concept only"),
  center: z.string().optional().describe("conceptmap only: the central concept"),
  branches: z
    .array(z.unknown())
    .optional()
    .describe("conceptmap only: {label, children?: string[]}"),
  nodes: z
    .array(z.unknown())
    .optional()
    .describe("diagram only: {id, label}"),
  edges: z
    .array(z.unknown())
    .optional()
    .describe("diagram only: {from, to, label?} — ids from nodes"),
  tabs: z.array(z.unknown()).optional(),
  question: z.string().optional().describe("quiz only"),
  options: z.array(z.unknown()).optional().describe("quiz only: {label, correct?, reaction?}"),
  explanation: z.string().optional().describe("quiz only: shown after answering"),
  steps: z.array(z.unknown()).optional().describe("flow only: {label, detail?}"),
  columns: z.array(z.unknown()).optional(),
  fields: z.array(z.unknown()).optional(),
  children: z.array(z.unknown()).optional().describe("Only card and stack nest children"),
});

// Loose at the rim too: `children` stays optional and unknown keys survive,
// so a model that passes ONE bare node as the whole input reaches execute
// (which wraps it) instead of dying in schema validation before repair.
export const renderUiInput = z.looseObject({
  children: z
    .array(looseNode)
    .min(1)
    .max(10)
    .optional()
    .describe(
      "Nodes. text:{type,'content',variant?} · list:{type,items:string[]} · " +
        "timeline:{type,items:{label?,title,description?}[]} · " +
        "comparison:{type,columns:{title,points:string[]}[]} · " +
        "card:{type,title?,accent?,children} · stack:{type,direction?,children}",
    ),
});

export type ConceptInput = z.infer<typeof conceptInput>;
export type ComparisonInput = z.infer<typeof comparisonInput>;
export type TimelineInput = z.infer<typeof timelineInput>;
export type FormInput = z.infer<typeof formInput>;
