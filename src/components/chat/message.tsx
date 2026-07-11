"use client";

import type { UIMessage } from "ai";
import { memo } from "react";
import { PartRenderer } from "./part-renderer";

type MessageParts = UIMessage["parts"];

/** Hidden messages (form answers) reach the model but never the screen. */
function isHidden(message: UIMessage): boolean {
  return (message.metadata as { hidden?: boolean } | undefined)?.hidden === true;
}

/**
 * No duplicates, no vanishing acts. Models sometimes re-issue the SAME
 * composition (a chart twice, a form repeated) — only the latest completed
 * copy earns pixels. But two DIFFERENT render_ui compositions in one answer
 * (a layout plus a follow-up actions block) are both legitimate: they are
 * told apart by their first block, never by the tool name — replacing by
 * tool name made the first layout disappear when the second call landed.
 */
function dedupeGeneratedBlocks(parts: MessageParts): MessageParts {
  const isDone = (part: MessageParts[number]) =>
    (part as { state?: string }).state === "output-available";
  // render_ui: keep the last copy of each distinct composition.
  const bySignature = new Map<string, number>();
  // Curated tools are singular by nature: keep the last completed one.
  const byTool = new Map<string, number>();
  parts.forEach((part, i) => {
    if (!part.type.startsWith("tool-")) return;
    if (part.type === "tool-render_ui") {
      if (!isDone(part)) return; // renders nothing until output arrives
      const output = (part as { output?: { children?: unknown[] } }).output;
      const signature = JSON.stringify(output?.children?.[0] ?? i);
      bySignature.set(signature, i);
      return;
    }
    const previous = byTool.get(part.type);
    if (previous === undefined || isDone(part) || !isDone(parts[previous])) {
      byTool.set(part.type, i);
    }
  });
  const keptRenderUi = new Set(bySignature.values());
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

/**
 * One chat message. Memoized so that, while the newest answer streams,
 * every already-completed message skips re-rendering — the chat stays
 * smooth no matter how long the conversation grows.
 *
 * `streaming` is true only for the message currently being generated: while
 * it is set, transient tool errors stay invisible (the model is usually
 * mid-retry) — a dead-end error earns pixels only once the stream settles.
 */
export const Message = memo(function Message({
  message,
  streaming = false,
}: {
  message: UIMessage;
  streaming?: boolean;
}) {
  if (isHidden(message)) return null;

  if (message.role === "user") {
    return (
      <div id={`msg-${message.id}`} className="flex scroll-mt-4 justify-end">
        <div className="enter glass max-w-[85%] rounded-2xl rounded-br-md bg-ink/[0.07] px-4 py-2.5 text-[15px]">
          {message.parts.map((part, i) =>
            part.type === "text" ? <span key={i}>{part.text}</span> : null,
          )}
        </div>
      </div>
    );
  }

  const parts = dedupeGeneratedBlocks(message.parts);
  return (
    <div className="space-y-3">
      {parts.map((part, i) => (
        <PartRenderer
          key={i}
          part={part}
          isLastPart={i === parts.length - 1 && !streaming}
          hasRenderedTool={parts.some((candidate) => candidate.type.startsWith("tool-"))}
        />
      ))}
    </div>
  );
});
