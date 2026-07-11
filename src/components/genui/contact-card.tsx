"use client";

import { useState } from "react";
import Image from "next/image";
import { OWNER } from "@/lib/content";
import { Tilt } from "@/components/tilt";

const PORTRAIT_SRC = "/davide.jpg"; // face crop in public/; falls back to initials

/** Facts come exclusively from src/lib/content.ts — the model sends nothing. */
export function ContactCard() {
  const [copied, setCopied] = useState(false);
  const [portraitMissing, setPortraitMissing] = useState(false);

  const initials = OWNER.name
    .split(" ")
    .map((part) => part[0])
    .join("");
  const primaryLink = OWNER.links[0];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(primaryLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — the button stays quiet
    }
  }

  return (
    <Tilt>
      <section className="glass shine enter accent-violet relative flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:p-7 sm:text-left">
        <div aria-hidden className="card-glow bg-acc-violet" />

        {/* Portrait inside the orbiting conic ring */}
        <div className="relative h-24 w-24 shrink-0">
          <div aria-hidden className="ring-spin absolute inset-0 rounded-full opacity-80" />
          <div className="absolute inset-[3px] overflow-hidden rounded-full bg-[var(--surface-solid)]">
            {portraitMissing ? (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold tracking-wide text-foreground">
                {initials}
              </div>
            ) : (
              <Image
                src={PORTRAIT_SRC}
                alt={OWNER.name}
                fill
                sizes="96px"
                className="object-cover"
                onError={() => setPortraitMissing(true)}
              />
            )}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight">{OWNER.name}</p>
          <p className="text-sm text-muted">{OWNER.role}</p>
          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted">
            {OWNER.note}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {OWNER.links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="glass rounded-full px-3.5 py-1.5 text-xs font-medium text-acc-cyan transition-colors hover:bg-ink/[0.08]"
              >
                {link.label} ↗
              </a>
            ))}
            <button
              type="button"
              onClick={copyLink}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                copied
                  ? "border-emerald-300/50 text-emerald-300"
                  : "border-ink/[0.12] text-muted hover:border-ink/[0.25] hover:text-foreground"
              }`}
            >
              {copied ? "Copied ✓" : "Copy link"}
            </button>
          </div>
        </div>
      </section>
    </Tilt>
  );
}
