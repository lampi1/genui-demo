"use client";

import type { UiNode, UiSpec } from "@/lib/ui-spec";
import { Carousel } from "./carousel";
import { Accordion } from "./genui/accordion";
import { Actions } from "./genui/actions";
import { CodeBlock } from "./genui/code-block";
import { Comparison } from "./genui/comparison";
import { GenChart } from "./genui/gen-chart";
import { GenForm } from "./genui/gen-form";
import { Callout, Chips, DataTable, Links, Progress } from "./genui/extras";
import { FlipCards } from "./genui/flip-cards";
import { Flow } from "./genui/flow";
import { Gauge } from "./genui/gauge";
import { Quiz } from "./genui/quiz";
import { Stats } from "./genui/stats";
import { Tabs } from "./genui/tabs";
import { Timeline } from "./genui/timeline";

const ACCENT_CLASS = {
  violet: "accent-violet",
  cyan: "accent-cyan",
  rose: "accent-rose",
  none: "",
} as const;

const TEXT_CLASS = {
  display:
    "gradient-text w-fit text-balance text-2xl sm:text-3xl font-semibold tracking-tight",
  lead: "text-base sm:text-lg font-medium leading-relaxed",
  body: "text-sm leading-relaxed text-foreground/90",
  caption: "text-xs text-muted",
  code: "font-mono text-xs sm:text-sm rounded-lg bg-ink/[0.06] border border-edge px-3 py-2 overflow-x-auto",
} as const;

/**
 * Blocks substantial enough to stand alone as a carousel slide. Small
 * garnishes (chips, callout, links, list, progress, text) never become
 * slides — a full-height view of three chips is a hole, not a scene.
 */
const SLIDE_TYPES = new Set<UiNode["type"]>([
  "card",
  "stack",
  "tabs",
  "accordion",
  "timeline",
  "comparison",
  "chart",
  "table",
  "form",
  "code",
  "stats",
  "quiz",
  "flow",
  "flipcards",
  "gauge",
]);

/**
 * The renderer — a pure mapping from a validated UI spec to design-system
 * blocks. Node types outside the allow-list never reach it (schema-validated
 * at the tool boundary).
 *
 * Composition layout: leading text frames the answer; substantial blocks
 * show one at a time in a carousel (2+); small garnish blocks stack below
 * it; actions close the answer, always visible, never behind a swipe.
 */
export function SpecRenderer({ spec }: { spec: UiSpec }) {
  const intro: UiNode[] = [];
  const slides: UiNode[] = [];
  const garnish: UiNode[] = [];
  // One row of follow-ups per answer: models sometimes repeat the actions
  // node inside a single spec — only the last one earns pixels.
  let actions: UiNode | null = null;
  for (const node of spec.children) {
    if (node.type === "actions") actions = node;
    else if (slides.length === 0 && garnish.length === 0 && node.type === "text") {
      intro.push(node);
    } else if (SLIDE_TYPES.has(node.type)) slides.push(node);
    else garnish.push(node);
  }

  // Slides carry no stagger: all but the first are offscreen at mount, and a
  // delayed entrance would greet an early swipe with a blank view.
  const slideNodes = slides.map((node, i) => <SpecNode key={i} node={node} index={0} />);

  return (
    <div className="space-y-3">
      {intro.map((node, i) => (
        <SpecNode key={`intro-${i}`} node={node} index={i} />
      ))}
      {slides.length >= 2 ? <Carousel>{slideNodes}</Carousel> : slideNodes}
      {garnish.map((node, i) => (
        <SpecNode key={`garnish-${i}`} node={node} index={i} />
      ))}
      {actions && <SpecNode node={actions} index={0} />}
    </div>
  );
}

function SpecNode({ node, index }: { node: UiNode; index: number }) {
  const stagger = { "--stagger": index } as React.CSSProperties;

  switch (node.type) {
    case "text":
      // Multi-line code parked in a text node deserves the real code block —
      // syntax header, copy button, horizontal scroll.
      if (node.variant === "code" && node.content.includes("\n")) {
        return <CodeBlock content={node.content} />;
      }
      return (
        <p className={`enter ${TEXT_CLASS[node.variant ?? "body"]}`} style={stagger}>
          {node.content}
        </p>
      );

    case "list": {
      const Tag = node.ordered ? "ol" : "ul";
      return (
        <Tag
          className={`enter space-y-2 pl-5 text-sm leading-relaxed ${
            node.ordered ? "list-decimal" : "list-disc"
          } marker:text-acc-cyan/70`}
          style={stagger}
        >
          {node.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </Tag>
      );
    }

    case "comparison":
      return <Comparison columns={node.columns} />;

    case "timeline":
      return <Timeline items={node.items} />;

    case "accordion":
      return <Accordion items={node.items} />;

    case "tabs":
      return <Tabs tabs={node.tabs} />;

    case "stats":
      return <Stats items={node.items} />;

    case "code":
      return <CodeBlock language={node.language} content={node.content} />;

    case "form":
      return (
        <GenForm
          title={node.title}
          description={node.description}
          submitLabel={node.submitLabel}
          fields={node.fields}
        />
      );

    case "actions":
      return <Actions buttons={node.buttons} />;

    case "chart":
      return (
        <GenChart kind={node.kind} title={node.title} suffix={node.suffix} data={node.data} />
      );

    case "progress":
      return <Progress items={node.items} />;

    case "callout":
      return <Callout tone={node.tone} title={node.title} content={node.content} />;

    case "chips":
      return <Chips items={node.items} />;

    case "table":
      return <DataTable columns={node.columns} rows={node.rows} />;

    case "links":
      return <Links items={node.items} />;

    case "quiz":
      return (
        <Quiz
          question={node.question}
          options={node.options}
          explanation={node.explanation}
        />
      );

    case "flow":
      return <Flow title={node.title} steps={node.steps} />;

    case "flipcards":
      return <FlipCards cards={node.cards} />;

    case "gauge":
      return <Gauge items={node.items} />;

    case "card":
      return (
        <section
          className={`glass enter p-5 sm:p-6 ${ACCENT_CLASS[node.accent ?? "none"]}`}
          style={stagger}
        >
          {node.title && (
            <h3 className="mb-3 text-base sm:text-lg font-semibold tracking-tight">
              {node.title}
            </h3>
          )}
          <div className="space-y-3">
            {node.children.map((child, i) => (
              <SpecNode key={i} node={child as UiNode} index={i} />
            ))}
          </div>
        </section>
      );

    case "stack":
      return (
        <div
          className={`enter ${
            node.direction === "horizontal"
              ? "grid gap-3 sm:grid-cols-2"
              : "space-y-3"
          }`}
          style={stagger}
        >
          {node.children.map((child, i) => (
            <SpecNode key={i} node={child as UiNode} index={i} />
          ))}
        </div>
      );

    default:
      return null;
  }
}
