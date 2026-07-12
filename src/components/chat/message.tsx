"use client";

import type { UIMessage } from "ai";
import { memo } from "react";
import { dedupeGeneratedBlocks } from "@/lib/dedupe-blocks";
import { PartRenderer } from "./part-renderer";

/** Hidden messages (form answers) reach the model but never the screen. */
function isHidden(message: UIMessage): boolean {
  return (message.metadata as { hidden?: boolean } | undefined)?.hidden === true;
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
