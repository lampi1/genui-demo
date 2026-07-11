"use client";

import type { UIMessagePart, UIDataTypes, UITools } from "ai";
import type {
  ComparisonInput,
  ConceptInput,
  FormInput,
  TimelineInput,
} from "@/lib/genui-tools";
import { GenForm } from "@/components/genui/gen-form";
import { splitSpecFences, stripComponentNarration } from "@/lib/spec-in-text";
import { parseUiSpec } from "@/lib/ui-spec";
import { CodeBlock } from "@/components/genui/code-block";
import { Comparison } from "@/components/genui/comparison";
import { ConceptCard } from "@/components/genui/concept-card";
import { ContactCard } from "@/components/genui/contact-card";
import { Timeline } from "@/components/genui/timeline";
import { GeneratedBlock } from "@/components/generated-block";
import { SpecRenderer } from "@/components/spec-renderer";
import { RetryNotice } from "./retry-notice";
import { StreamedText } from "./streamed-text";

// No skeletons: while a block is still materializing the chat shows only the
// rotating LoadingStatus pill; the component pops in whole when ready.


type Part = UIMessagePart<UIDataTypes, UITools>;

export function PartRenderer({
  part,
  isLastPart = true,
  hasRenderedTool = false,
}: {
  part: Part;
  /** Failed attempts followed by a retry are internal mechanics — hidden. */
  isLastPart?: boolean;
  /** A component already rendered in this message: strip markdown narration. */
  hasRenderedTool?: boolean;
}) {
  if (part.type === "text") {
    const raw = hasRenderedTool ? stripComponentNarration(part.text) : part.text;
    if (!raw.trim()) return null;
    const streaming = part.state === "streaming";
    // Models sometimes narrate the spec as JSON in text instead of calling
    // render_ui — salvage it into real UI instead of showing raw JSON.
    // Once a component has rendered, plain prose adds nothing the UI doesn't
    // already say: only salvaged UI and code survive from the text.
    const segments = splitSpecFences(raw, streaming).filter(
      (segment) => !(hasRenderedTool && segment.kind === "text"),
    );
    return (
      <>
        {segments.map((segment, i) => {
          const isLastSegment = i === segments.length - 1;
          switch (segment.kind) {
            case "text":
              return (
                <p
                  key={i}
                  className={`enter max-w-prose whitespace-pre-wrap text-[15px] leading-relaxed ${
                    streaming && isLastSegment ? "caret" : ""
                  }`}
                >
                  <StreamedText text={segment.text} />
                </p>
              );
            case "spec":
              return (
                <GeneratedBlock key={i}>
                  <SpecRenderer spec={segment.spec} />
                </GeneratedBlock>
              );
            case "code":
              return (
                <GeneratedBlock key={i}>
                  <CodeBlock language="json" content={segment.raw} />
                </GeneratedBlock>
              );
            case "pending":
              return null;
          }
        })}
      </>
    );
  }

  if (!part.type.startsWith("tool-")) return null;

  const toolPart = part as Extract<Part, { type: `tool-${string}` }>;
  const { state } = toolPart;

  if (state === "input-streaming") return null;
  // The model self-heals schema misses: an error with parts after it means a
  // retry is underway (or done) — only a dead-end error deserves pixels, and
  // never the raw teaching text, which is addressed to the model.
  if (state === "output-error")
    return isLastPart ? (
      <RetryNotice message="This layout dissolved mid-generation." />
    ) : null;
  // input-available | output-available: the input already carries everything.
  const input = toolPart.input;

  switch (part.type) {
    case "tool-show_concept":
      return (
        <GeneratedBlock>
          <ConceptCard {...(input as ConceptInput)} />
        </GeneratedBlock>
      );
    case "tool-show_comparison":
      return (
        <GeneratedBlock>
          <Comparison {...(input as ComparisonInput)} />
        </GeneratedBlock>
      );
    case "tool-show_timeline":
      return (
        <GeneratedBlock>
          <Timeline {...(input as TimelineInput)} />
        </GeneratedBlock>
      );
    case "tool-show_form":
      return (
        <GeneratedBlock>
          <GenForm {...(input as FormInput)} />
        </GeneratedBlock>
      );
    case "tool-show_contact":
      return (
        <GeneratedBlock>
          <ContactCard />
        </GeneratedBlock>
      );
    case "tool-render_ui": {
      // The server's execute validates and normalizes; render only its output.
      if (state !== "output-available") return null;
      const spec = parseUiSpec(toolPart.output);
      return spec ? (
        <GeneratedBlock>
          <SpecRenderer spec={spec} />
        </GeneratedBlock>
      ) : null;
    }
    default:
      return null;
  }
}

