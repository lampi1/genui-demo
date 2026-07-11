/** Small presentational blocks: progress meters, callout, chips, table, links. */

export function Progress({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  return (
    <div className="glass enter space-y-3.5 p-5 sm:p-6">
      {items.map((item, i) => (
        <div key={i}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate text-muted">{item.label}</span>
            <span className="tabular-nums text-foreground/85">{Math.round(item.value)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/[0.06]">
            <div
              className="fill-grow h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
              style={{ width: `${item.value}%`, "--stagger": i } as React.CSSProperties}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const TONE = {
  info: { icon: "ⓘ", edge: "border-l-acc-cyan/70", text: "text-acc-cyan" },
  tip: { icon: "✦", edge: "border-l-acc-violet/70", text: "text-acc-violet" },
  warning: { icon: "⚠", edge: "border-l-amber-300/70", text: "text-amber-200" },
} as const;

export function Callout({
  tone = "info",
  title,
  content,
}: {
  tone?: keyof typeof TONE;
  title?: string;
  content: string;
}) {
  const look = TONE[tone];
  return (
    <aside
      className={`glass enter border-l-2 p-4 pl-4 sm:p-5 sm:pl-5 ${look.edge}`}
      role="note"
    >
      <div className="flex gap-3">
        <span aria-hidden className={`text-sm ${look.text}`}>
          {look.icon}
        </span>
        <div className="min-w-0">
          {title && <p className={`mb-0.5 text-sm font-semibold ${look.text}`}>{title}</p>}
          <p className="text-sm leading-relaxed text-foreground/90">{content}</p>
        </div>
      </div>
    </aside>
  );
}

export function Chips({ items }: { items: string[] }) {
  return (
    <div className="enter flex flex-wrap gap-2">
      {items.map((chip, i) => (
        <span
          key={i}
          className="enter rounded-full border border-ink/[0.12] bg-ink/[0.04] px-3 py-1 text-xs text-foreground/85"
          style={{ "--stagger": i } as React.CSSProperties}
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="glass enter overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink/[0.08]">
            {columns.map((column, i) => (
              <th
                key={i}
                className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-wider text-muted"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? "bg-ink/[0.02]" : ""}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top leading-relaxed text-foreground/90">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Links({
  items,
}: {
  items: { label: string; url: string; note?: string }[];
}) {
  return (
    <div className="enter grid gap-2 sm:grid-cols-2">
      {items.map((link, i) => {
        const host = new URL(link.url).hostname.replace(/^www\./, "");
        return (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="glass enter group flex items-start gap-3 p-3.5 transition-colors hover:bg-ink/[0.06]"
            style={{ "--stagger": i } as React.CSSProperties}
          >
            <span
              aria-hidden
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/25 to-cyan-400/25 text-xs text-acc-cyan"
            >
              ↗
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium group-hover:text-acc-cyan">
                {link.label}
              </span>
              {link.note && (
                <span className="block text-xs leading-snug text-muted">{link.note}</span>
              )}
              <span className="block font-mono text-[10px] text-muted/70">{host}</span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
