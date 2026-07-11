/**
 * Compact charts for chat width. Palette validated with the dataviz method
 * against the dark card surface (#10131f): lightness band, chroma floor, CVD
 * separation and contrast all pass. Bars/line are single-measure → one hue;
 * only the donut uses the categorical order (fixed, never cycled), with
 * direct labels as secondary encoding.
 */
const CATEGORICAL = ["#8b5cf6", "#0891b2", "#f43f5e", "#d97706"] as const;
const SINGLE_HUE = "#8b5cf6";

type Datum = { label: string; value: number };

type ChartProps = {
  kind?: "bar" | "donut" | "line";
  title?: string;
  suffix?: string;
  data: Datum[];
};

const fmt = (value: number) =>
  Number.isInteger(value) ? value.toLocaleString("en-US") : value.toFixed(1);

export function GenChart({ kind = "bar", title, suffix = "", data }: ChartProps) {
  return (
    <section className="glass enter p-5 sm:p-6">
      {title && <h3 className="mb-4 text-sm font-semibold tracking-tight">{title}</h3>}
      {kind === "bar" && <Bars data={data} suffix={suffix} />}
      {kind === "donut" && <Donut data={data} suffix={suffix} />}
      {kind === "line" && <Line data={data} suffix={suffix} />}
    </section>
  );
}

function Bars({ data, suffix }: { data: Datum[]; suffix: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2.5 border-l border-ink/[0.12] pl-3">
      {data.map((d, i) => (
        <div key={i} className="grid grid-cols-[7rem_1fr_auto] items-center gap-2.5">
          <span className="truncate text-xs text-muted" title={d.label}>
            {d.label}
          </span>
          <div className="h-2.5">
            <div
              className="fill-grow h-full rounded-r-[4px]"
              title={`${d.label}: ${fmt(d.value)}${suffix}`}
              style={{
                width: `${(d.value / max) * 100}%`,
                background: SINGLE_HUE,
                ["--stagger" as string]: i,
              }}
            />
          </div>
          <span className="text-xs tabular-nums text-foreground/85">
            {fmt(d.value)}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

function Donut({ data, suffix }: { data: Datum[]; suffix: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const R = 44;
  const C = 2 * Math.PI * R;
  const GAP = 2; // px surface gap between segments
  const offsets = data.reduce<number[]>((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + (data[i - 1].value / total) * C);
    return acc;
  }, []);
  const top = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90 shrink-0">
        {data.map((d, i) => {
          const length = Math.max((d.value / total) * C - GAP, 0);
          return (
            <circle
              key={i}
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={CATEGORICAL[i % CATEGORICAL.length]}
              strokeWidth="12"
              strokeDasharray={`${length} ${C - length}`}
              strokeDashoffset={-offsets[i]}
              className="enter"
              style={{ "--stagger": i } as React.CSSProperties}
            >
              <title>{`${d.label}: ${fmt(d.value)}${suffix} (${Math.round((d.value / total) * 100)}%)`}</title>
            </circle>
          );
        })}
      </svg>
      <div className="min-w-0 flex-1 space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: CATEGORICAL[i % CATEGORICAL.length] }}
            />
            <span className="truncate text-muted">{d.label}</span>
            <span className="ml-auto tabular-nums text-foreground/85">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
        <p className="pt-1 text-[11px] text-muted/70">
          {top.label} leads at {Math.round((top.value / total) * 100)}%.
        </p>
      </div>
    </div>
  );
}

function Line({ data, suffix }: { data: Datum[]; suffix: string }) {
  const W = 320;
  const H = 96;
  const PAD = 8;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const span = max - min || 1;
  const x = (i: number) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);
  const points = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const last = data[data.length - 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={data.map((d) => `${d.label} ${fmt(d.value)}${suffix}`).join(", ")}
      >
        <line
          x1={PAD}
          y1={H - PAD}
          x2={W - PAD}
          y2={H - PAD}
          stroke="var(--edge)"
          strokeWidth="1"
        />
        <polyline
          points={points}
          fill="none"
          stroke={SINGLE_HUE}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className="stroke-draw"
        />
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.value)} r="4" fill={SINGLE_HUE}>
            <title>{`${d.label}: ${fmt(d.value)}${suffix}`}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-muted">
        <span>{data[0].label}</span>
        <span className="text-foreground/85">
          {last.label}: {fmt(last.value)}
          {suffix}
        </span>
      </div>
    </div>
  );
}
