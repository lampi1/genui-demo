import type { UIMessage } from "ai";

type MessageParts = UIMessage["parts"];

/**
 * No duplicates, no vanishing acts. Models re-issue near-identical
 * compositions (observed live: the same answer generated twice, lightly
 * reworded — a first-block signature let those through). The prompt's
 * contract is ONE composition per answer, so exactly one completed CONTENT
 * composition earns pixels: the last. The one legitimate second call — a
 * follow-up block holding only actions — keeps its own slot.
 */
export function dedupeGeneratedBlocks(parts: MessageParts): MessageParts {
  const isDone = (part: MessageParts[number]) =>
    (part as { state?: string }).state === "output-available";

  // The contact card is the ENTIRE answer (owner's rule): once it has
  // completed, nothing else in the message earns pixels — no text, no
  // follow-up actions the model tacked on despite the prompt.
  const contactCards = parts.filter(
    (part) => part.type === "tool-show_contact" && isDone(part),
  );
  if (contactCards.length > 0) return contactCards.slice(-1);
  const isActionsOnly = (part: MessageParts[number]) => {
    const children = (part as { output?: { children?: { type?: string }[] } })
      .output?.children;
    return (
      Array.isArray(children) &&
      children.every((child) => child?.type === "actions")
    );
  };
  let lastContent = -1;
  let lastActionsOnly = -1;
  // Curated tools are singular by nature: keep the last completed one.
  const byTool = new Map<string, number>();
  parts.forEach((part, i) => {
    if (!part.type.startsWith("tool-")) return;
    if (part.type === "tool-render_ui") {
      if (!isDone(part)) return; // renders nothing until output arrives
      if (isActionsOnly(part)) lastActionsOnly = i;
      else lastContent = i;
      return;
    }
    const previous = byTool.get(part.type);
    if (previous === undefined || isDone(part) || !isDone(parts[previous])) {
      byTool.set(part.type, i);
    }
  });
  const keptRenderUi = new Set([lastContent, lastActionsOnly]);
  // Models also repeat themselves in prose — a sentence said once is enough.
  const seenText = new Set<string>();
  return parts.filter((part, i) => {
    if (part.type === "text") {
      const words = part.text.trim();
      if (words && seenText.has(words)) return false;
      seenText.add(words);
      return true;
    }
    if (part.type === "tool-render_ui") return !isDone(part) || keptRenderUi.has(i);
    return !part.type.startsWith("tool-") || byTool.get(part.type) === i;
  });
}
