import { parseUiSpec, type UiSpec } from "./ui-spec";

/**
 * Some models narrate the UI spec in their text instead of calling the
 * render_ui tool — as a ```json fence, as a whole-message bare spec, or as a
 * single bare node pasted mid-prose ({"type":"actions",…}). Salvage all of
 * it: JSON that looks like a spec is parsed, repaired and rendered as real
 * UI; while it is still streaming it shows as a pending block, never as raw
 * JSON.
 */
export type TextSegment =
  | { kind: "text"; text: string }
  | { kind: "spec"; spec: UiSpec }
  | { kind: "code"; raw: string }
  | { kind: "pending" };

const FENCE = /```(?:json)?\s*([\s\S]*?)```/g;

/** Opening of a bare spec node (or whole spec) typed straight into prose. */
const NODE_START = /\{\s*"(?:type|children)"\s*:/g;

function classifyJson(raw: string): TextSegment | null {
  try {
    const value: unknown = JSON.parse(raw);
    // A full spec, or a lone node worth wrapping into one. JSON that can't
    // become UI is technical debris — visitors never see it (null).
    const spec = parseUiSpec(value) ?? parseUiSpec({ children: [value] });
    return spec ? { kind: "spec", spec } : null;
  } catch {
    // Not JSON at all: a real code snippet the model chose to share.
    return { kind: "code", raw: raw.trim() };
  }
}

/** End index (exclusive) of the balanced JSON object opening at `start`, or -1. */
function findObjectEnd(text: string, start: number): number {
  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (char === "\\") i += 1;
      else if (char === '"') inString = false;
    } else if (char === '"') inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

/**
 * Bare spec nodes pasted mid-prose (the model parroting a shape example
 * instead of calling render_ui) become real UI; braces that never parse into
 * an allowed node stay untouched prose; a half-streamed node hides behind a
 * pending block instead of flashing raw JSON.
 */
function salvageBareNodes(text: string, streaming: boolean): TextSegment[] {
  const segments: TextSegment[] = [];
  let cursor = 0;

  NODE_START.lastIndex = 0;
  for (let match = NODE_START.exec(text); match; match = NODE_START.exec(text)) {
    const end = findObjectEnd(text, match.index);
    if (end === -1) {
      if (!streaming) break;
      const before = text.slice(cursor, match.index).trim();
      if (before) segments.push({ kind: "text", text: before });
      segments.push({ kind: "pending" });
      return segments;
    }
    let spec: UiSpec | null = null;
    try {
      const value: unknown = JSON.parse(text.slice(match.index, end));
      spec = parseUiSpec(value) ?? parseUiSpec({ children: [value] });
    } catch {
      // not JSON after all — leave the braces as prose
    }
    if (spec) {
      const before = text.slice(cursor, match.index).trim();
      if (before) segments.push({ kind: "text", text: before });
      segments.push({ kind: "spec", spec });
      cursor = end;
      NODE_START.lastIndex = end;
    }
  }

  const rest = text.slice(cursor).trim();
  if (rest) {
    // While streaming, a trailing unclosed brace is JSON being born — hide
    // it behind the pending state instead of flashing raw syntax.
    const open = rest.lastIndexOf("{");
    if (streaming && open !== -1 && !rest.includes("}", open)) {
      const before = rest.slice(0, open).trim();
      if (before) segments.push({ kind: "text", text: before });
      segments.push({ kind: "pending" });
      return segments;
    }
    segments.push({ kind: "text", text: rest });
  }
  return segments;
}

/**
 * Small models narrate the rendered component as a markdown outline in their
 * text. When a real component already rendered in the message, those list
 * lines are pure duplication — keep only the plain framing sentences.
 */
export function stripComponentNarration(text: string): string {
  return text
    .split("\n")
    .filter(
      (line) =>
        !/^\s*([-*•#]|\d+[.)]|(step|passo)\s+\d+\s*[—:-])/i.test(line) &&
        // Stage directions ("[Comparison rendered above]") and badge labels.
        !/^\s*\[[^\]]*\]\s*$/.test(line) &&
        !/^(Composed live by AI|Designed by a human|Free generation|Tool call|JSON composition|Freeform)$/i.test(
          line.trim(),
        ),
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitSpecFences(text: string, streaming: boolean): TextSegment[] {
  const segments: TextSegment[] = [];
  let cursor = 0;

  // Whole message is one bare JSON spec — or one bare node (no fences).
  const bare = text.trim();
  const bareNode = /^\{\s*"type"\s*:/.test(bare);
  if (bare.startsWith("{") && (bare.includes('"children"') || bareNode) && !bare.includes("```")) {
    if (streaming) return [{ kind: "pending" }];
    const segment = classifyJson(bare);
    return segment ? [segment] : [];
  }

  // Envelope tic: some models wrap their sentence in a JSON object
  // ({"error": "Here's a live timeline…"}). Unwrap the words.
  if (bare.startsWith("{") && bare.endsWith("}") && !bare.includes("```")) {
    try {
      const value: unknown = JSON.parse(bare);
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const strings = Object.values(value).filter(
          (entry): entry is string => typeof entry === "string",
        );
        if (strings.length > 0 && strings.join("").length > bare.length / 3) {
          return [{ kind: "text", text: strings.join(" ") }];
        }
      }
    } catch {
      // not JSON after all — fall through to plain text
    }
  }

  FENCE.lastIndex = 0;
  for (let match = FENCE.exec(text); match; match = FENCE.exec(text)) {
    const before = text.slice(cursor, match.index).trim();
    if (before) segments.push({ kind: "text", text: before });
    const fenced = classifyJson(match[1]);
    if (fenced) segments.push(fenced);
    cursor = match.index + match[0].length;
  }

  const rest = text.slice(cursor);
  const openFence = rest.indexOf("```");
  if (openFence !== -1) {
    // Unterminated fence: render the prose, hide the half-born JSON.
    const before = rest.slice(0, openFence).trim();
    if (before) segments.push({ kind: "text", text: before });
    const tail = streaming
      ? { kind: "pending" as const }
      : classifyJson(rest.slice(openFence + 3).replace(/^json\s*/i, ""));
    if (tail) segments.push(tail);
  } else if (rest.trim()) {
    segments.push({ kind: "text", text: rest.trim() });
  }

  // Bare nodes hiding inside the prose segments become UI too; only the
  // final segment can still be mid-stream.
  return segments.flatMap((segment, i) =>
    segment.kind === "text"
      ? salvageBareNodes(segment.text, streaming && i === segments.length - 1)
      : [segment],
  );
}
