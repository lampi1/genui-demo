"use client";

import { useState } from "react";

type CodeBlockProps = {
  language?: string;
  content: string;
};

export function CodeBlock({ language, content }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable (permissions/insecure context) — button stays quiet
    }
  }

  return (
    <div className="glass enter overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink/[0.06] px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
          {language ?? "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-pressed={copied}
          className={`copy-chip rounded-md px-2.5 py-1 text-[11px] transition-all active:scale-95 ${
            copied ? "" : "text-muted hover:bg-ink/[0.06] hover:text-foreground"
          }`}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed sm:text-[13px]">
        {content}
      </pre>
    </div>
  );
}
