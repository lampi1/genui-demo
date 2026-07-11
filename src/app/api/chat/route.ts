import {
  convertToModelMessages,
  hasToolCall,
  smoothStream,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import {
  comparisonInput,
  conceptInput,
  contactInput,
  formInput,
  renderUiInput,
  timelineInput,
} from "@/lib/genui-tools";
import {
  buildChatModel,
  groqProviderOptions,
  openaiProviderOptions,
  retryDelaySeconds,
} from "@/lib/model";
import { retryAfterSeconds as budgetRetryAfter } from "@/lib/rate-limit";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { parseUiSpec } from "@/lib/ui-spec";

export const maxDuration = 30;

// The tools render client-side from their input; execute just completes the
// call so the part reaches the `output-available` state.
const echo = async <T,>(input: T) => input;

// Abuse guards: bound what a single request can cost before it reaches the
// model. The free tier's hard cap remains the ultimate ceiling.
const MAX_MESSAGES = 40;
const MAX_BODY_CHARS = 60_000;

// Per-IP interaction budget (see src/lib/rate-limit.ts — the client draws
// the same numbers on the quota ring). In-memory, so per server instance;
// the provider caps remain the hard ceiling behind it.
const requestLog = new Map<string, number[]>();

/**
 * History goes back to the model as PLAIN CONTENT. Reasoning parts and
 * provider metadata carry OpenAI item references ("rs_…", "msg_…") that the
 * Responses API re-resolves server-side; once expired or split from their
 * pair, the whole request dies ("Item not found" / "provided without its
 * required reasoning item"). The fallback providers can't use them anyway,
 * and dropping them trims every request.
 */
function sanitizeHistory(messages: UIMessage[]): UIMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: message.parts
      .filter((part) => part.type !== "reasoning")
      .map((part) => {
        const clean = { ...(part as Record<string, unknown>) };
        delete clean.providerMetadata;
        delete clean.callProviderMetadata;
        return clean as typeof part;
      }),
  }));
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const retryAfter = budgetRetryAfter(requestLog, ip);
  if (retryAfter > 0) {
    // The client turns this exact shape into a visible countdown.
    return new Response(`RATE_LIMITED:${retryAfter}`, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const messages = Array.isArray(body?.messages)
    ? (body.messages as UIMessage[])
    : null;
  if (!messages || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (JSON.stringify(messages).length > MAX_BODY_CHARS) {
    return Response.json({ error: "Conversation too large" }, { status: 413 });
  }

  const result = streamText({
    model: buildChatModel(),
    system: buildSystemPrompt(),
    // The system prompt + tools already cost ~3.5k tokens per call; unbounded
    // history on top of that is what really drains per-minute token budgets.
    messages: await convertToModelMessages(sanitizeHistory(messages.slice(-12))),
    maxOutputTokens: 2500,
    // The provider chain already switches on 429 inside a single attempt;
    // the SDK's default 3 attempts on top silently multiplied request burn
    // against the shared 15 req/min free-tier budget.
    maxRetries: 1,
    // Providers emit text in uneven bursts; re-chunking by word at a fixed
    // cadence gives the framing sentences the same steady reveal as the
    // components' entrance animations. Tool-call parts pass through untouched.
    experimental_transform: smoothStream({ delayInMs: 15 }),
    // Schema-rejected tool inputs consume a step each before the retry lands.
    // A form is terminal: the next move belongs to the visitor, so generation
    // stops there instead of piling up repeated forms.
    stopWhen: [stepCountIs(5), hasToolCall("show_form")],
    // The demo's contract: every answer opens with generated UI. Forcing a
    // tool call on the first step stops smaller models from narrating the
    // interface as markdown; later steps stay free for the closing sentence.
    prepareStep: ({ steps }) =>
      steps.length === 0 ? { toolChoice: "required" } : {},
    providerOptions: {
      ...(openaiProviderOptions() ? { openai: openaiProviderOptions()! } : {}),
      ...(groqProviderOptions() ? { groq: groqProviderOptions()! } : {}),
    },
    tools: {
      show_concept: tool({
        description:
          "Present ONE concept as a polished card: title, optional tagline, punchy points. " +
          "NOT for multiple alternatives (show_comparison) or sequences (show_timeline).",
        inputSchema: conceptInput,
        execute: echo,
      }),
      show_comparison: tool({
        description:
          "Compare 2-3 alternatives side by side. NOT for a single concept or for sequences.",
        inputSchema: comparisonInput,
        execute: echo,
      }),
      show_timeline: tool({
        description:
          "Show an ordered sequence: steps, evolution, history. NOT for unordered points — that's show_concept.",
        inputSchema: timelineInput,
        execute: echo,
      }),
      show_form: tool({
        description:
          "Present a short interactive form (1-5 fields: radio pills, select, text, textarea) ONLY when the visitor's personal context would change your answer " +
          "(e.g. 'which approach fits MY project?'). NEVER use it to explain, compare or present content — that's render_ui/tabs/comparison territory. " +
          "Their answers arrive as their next message — tailor your following generation to them.",
        inputSchema: formInput,
        execute: echo,
      }),
      show_contact: tool({
        description:
          "Show the contact card of the page's author. ONLY when the visitor asks who made this page or how to reach them.",
        inputSchema: contactInput,
        execute: echo,
      }),
      render_ui: tool({
        description:
          "Freely compose a small custom interface from allow-listed blocks: stack, card, text, list, comparison, timeline, " +
          "accordion, tabs, stats (count up), chart (bar|donut|line via kind + data:[{label,value:number}]), progress (0-100 meters), " +
          "callout (info|tip|warning), chips (tag strings), table (columns+rows), links (official URLs from knowledge only), " +
          "actions (tappable follow-ups: buttons:[{label,message?}]), form, " +
          "code ({content: snippet with real newlines, language?} — the ONLY way to show code), " +
          "quiz (question + options:[{label, correct?, reaction?}] with EXACTLY ONE correct:true + explanation). " +
          "Use when no curated tool fits. VARY the blocks: never the same layout twice in a row, don't default to accordion, mix kinds in one composition. " +
          "Shapes: text has {content, variant?} — never title; list items are plain strings; " +
          "{title, description} sequences are a timeline; {title, content} sequences are an accordion; " +
          "tabs has tabs:[{label, content}]; stats has items:[{value:number, label, prefix?, suffix?}]; " +
          "only card and stack have children; every node carries real content.",
        inputSchema: renderUiInput,
        // Strict contract enforced here: repair near-misses, refuse the rest
        // with a teaching error the model can act on in its retry.
        execute: async (input) => {
          // Observed live: the model sometimes passes ONE node as the whole
          // input ({"type":"actions",…}) — wrap it instead of rejecting.
          const candidate = Array.isArray(input.children)
            ? input
            : { children: [input] };
          const spec = parseUiSpec(candidate);
          if (!spec) {
            // Log the unsalvageable shape: every repair rule so far came
            // from one of these.
            console.error(
              "[chat] unsalvageable ui spec:",
              JSON.stringify(input)?.slice(0, 1500),
            );
            throw new Error(
              "Invalid ui spec. Rules: text nodes need 'content' (never 'title'); " +
                "list items are plain strings; collection nodes need their arrays — " +
                "accordion items:[{title,content}] (2-6), tabs tabs:[{label,content}] (2-4), " +
                "stats items:[{value:number,label}] (1-4), comparison columns (2-3), " +
                "form fields (1-5), quiz options (2-4 with EXACTLY ONE correct:true); " +
                "only card and stack have 'children' (max 3 levels).",
            );
          }
          return spec;
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    // The SDK masks error details by default. Two exceptions are deliberate:
    // our spec-validation error must reach the model (or its retry stays
    // blind), and rate limits carry Google's own retry delay, which the UI
    // turns into a visible countdown. Everything else stays generic.
    onError: (error) => {
      const message = error instanceof Error ? error.message : "";
      // AI SDK error objects serialize to {} — log the readable parts.
      console.error(
        "[chat] generation error:",
        message || JSON.stringify(error, Object.getOwnPropertyNames(error ?? {})),
      );
      if (message.startsWith("Invalid ui spec")) return message;
      // Google says "retry in Xs", Groq says "try again in XmYs".
      const retryAfter = retryDelaySeconds(error);
      if (retryAfter !== null) return `RATE_LIMITED:${retryAfter}`;
      if (/quota|high demand|resource.?exhausted|rate.?limit|429/i.test(message)) {
        return "RATE_LIMITED:60";
      }
      return "Generation failed. Please try again.";
    },
  });
}
