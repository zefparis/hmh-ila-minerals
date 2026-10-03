import type { CSSProperties } from "react";

/** Auto-scaling SVG line chart (the "x-" charts in the prototypes). */
export function LiveLine({
  series,
  colors,
  area,
  label = "Chart",
  fmt = (v: number) => v.toFixed(1),
}: {
  series: number[][];
  colors: string[];
  area?: boolean;
  label?: string;
  fmt?: (v: number) => string;
}) {
  const W = 440;
  const H = 180;
  const p = 30;
  const all = series.flat();
  let mn = Math.min(...all);
  let mx = Math.max(...all);
  const pd = (mx - mn || 1) * 0.12;
  mn -= pd;
  mx += pd;
  const n = series[0].length;
  const x = (i: number) => p + (i * (W - p - 8)) / (n - 1);
  const y = (v: number) => H - 22 - ((v - mn) / (mx - mn)) * (H - 34);
  const grids = [0, 1, 2].map((k) => mn + ((mx - mn) * (k + 0.5)) / 3);
  const paths = series.map((s) => s.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" "));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={label}>
      {grids.map((v, k) => (
        <g key={k}>
          <line x1={p} x2={W - 8} y1={y(v)} y2={y(v)} stroke="var(--line)" />
          <text x={2} y={y(v) + 4} fontSize={10} fill="var(--muted)">
            {fmt(v)}
          </text>
        </g>
      ))}
      {series.map((s, j) => (
        <g key={j}>
          {j === 0 && area ? (
            <path
              d={`${paths[j]} L${x(n - 1)} ${H - 22} L${x(0)} ${H - 22}Z`}
              fill={colors[0]}
              opacity={0.12}
            />
          ) : null}
          <path d={paths[j]} fill="none" stroke={colors[j]} strokeWidth={2.5} strokeLinejoin="round" />
          <circle cx={x(n - 1)} cy={y(s[n - 1])} r={4} fill={colors[j]} />
        </g>
      ))}
      <text x={W - 8} y={H - 6} fontSize={10} fill="var(--muted)" textAnchor="end">
        now
      </text>
    </svg>
  );
}

/** Small sparkline used inside market cards. */
export function Spark({ s, up }: { s: number[]; up: boolean }) {
  const W = 150;
  const H = 36;
  const mn = Math.min(...s);
  const mx = Math.max(...s);
  const n = s.length;
  const d = s
    .map((v, i) => (i ? "L" : "M") + ((i * W) / (n - 1)).toFixed(1) + " " + (H - 2 - ((v - mn) / (mx - mn || 1)) * (H - 4)).toFixed(1))
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 36 }} aria-hidden="true">
      <path d={d} fill="none" stroke={up ? "var(--ok)" : "var(--alert)"} strokeWidth={2} />
    </svg>
  );
}

/** Agri "Provincial insights": sales rising while support paid falls. */
export function TwoLine({ labels, a, b }: { labels: string[]; a: number[]; b: number[] }) {
  const W = 360;
  const H = 180;
  const p = 28;
  const max = 3.2;
  const x = (i: number) => p + (i * (W - 2 * p)) / (labels.length - 1);
  const y = (v: number) => H - p - (v / max) * (H - 2 * p);
  const path = (arr: number[]) => arr.map((v, i) => (i ? "L" : "M") + x(i) + " " + y(v)).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} role="img" aria-label="Sales rising while support paid falls">
      {[0, 1, 2, 3].map((v) => (
        <g key={v}>
          <line x1={p} x2={W - p} y1={y(v)} y2={y(v)} stroke="var(--line)" />
          <text x={4} y={y(v) + 4} fontSize={10} fill="var(--muted)">
            {v}
          </text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={l} x={x(i)} y={H - 8} fontSize={10} fill="var(--muted)" textAnchor="middle">
          {l}
        </text>
      ))}
      <path d={path(b)} fill="none" stroke="var(--accent)" strokeWidth={3} />
      <path d={path(a)} fill="none" stroke="var(--ok)" strokeWidth={3} />
    </svg>
  );
}

/** Minerals "Prices and risk": monthly bar chart. */
export function MonthBars({ labels, v }: { labels: string[]; v: number[] }) {
  const W = 360;
  const H = 180;
  const p = 28;
  const max = 14;
  const x = (i: number) => p + (i * (W - 2 * p)) / (labels.length - 1);
  const y = (n: number) => H - p - (n / max) * (H - 2 * p);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} role="img" aria-label="Sales rising each month">
      {[0, 5, 10].map((n) => (
        <g key={n}>
          <line x1={p} x2={W - p} y1={y(n)} y2={y(n)} stroke="var(--line)" />
          <text x={4} y={y(n) + 4} fontSize={10} fill="var(--muted)">
            {n}
          </text>
        </g>
      ))}
      {labels.map((l, i) => (
        <g key={l}>
          <rect x={x(i) - 12} y={y(v[i])} width={24} height={H - p - y(v[i])} rx={4} fill="var(--mid)" />
          <text x={x(i)} y={H - 8} fontSize={10} fill="var(--muted)" textAnchor="middle">
            {l}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Agri "Grading and inspection": labelled percent bars. */
export function BarRows({ rows }: { rows: [string, number][] }) {
  const max = Math.max(...rows.map((r) => r[1]));
  return (
    <>
      {rows.map((r) => (
        <div key={r[0]} style={{ margin: "8px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
            <span>{r[0]}</span>
            <b>{r[1]}%</b>
          </div>
          <div className="bar" style={{ height: 12 }}>
            <i style={{ width: `${(r[1] / max) * 100}%`, background: "var(--sky)" }} />
          </div>
        </div>
      ))}
    </>
  );
}

/** Horizontal bar with label and value text (x-hbar). */
export function HBar({ l, val, max, txt, cls }: { l: string; val: number; max: number; txt: string; cls?: string }) {
  return (
    <div className="x-hbar">
      <div>
        <span>{l}</span>
        <b>{txt}</b>
      </div>
      <div className="t">
        <i className={cls || ""} style={{ width: `${Math.min(100, (val / max) * 100).toFixed(1)}%` }} />
      </div>
    </div>
  );
}

/** Fund control support pipeline. */
export function FunnelRows({ stages }: { stages: [string, number, string][] }) {
  const max = stages[0][1];
  return (
    <>
      {stages.map((s) => (
        <div className="row" key={s[0]}>
          <span>{s[0]}</span>
          <div className="track">
            <div className="fill" style={{ width: `${((s[1] / max) * 100).toFixed(0)}%` }} />
          </div>
          <span>
            <b>{s[1]}</b>
            <br />
            <small className="muted">{s[2]}</small>
          </span>
        </div>
      ))}
    </>
  );
}

/** Instrument stage steps (x-steps). */
export function Steps({ count, current }: { count: number; current: number }) {
  return (
    <div className="x-steps">
      {Array.from({ length: count }, (_, i) => (
        <i key={i} className={i < current ? "d" : i === current ? "c" : ""} />
      ))}
    </div>
  );
}

/** Schematic district map (Agri provincial overview). */
export function DistrictMap({ counts, onSelect }: { counts: number[]; onSelect: () => void }) {
  const pos: [number, number][] = [
    [190, 40],
    [120, 140],
    [20, 60],
    [230, 150],
  ];
  const cols = ["#2B4F3B", "#3E6B4F", "#8FA67A", "#E9AE1B"];
  const names = ["Bojanala Platinum", "Ngaka Modiri Molema", "Dr Ruth Segomotsi Mompati", "Dr Kenneth Kaunda"];
  return (
    <svg viewBox="0 0 380 260" role="img" aria-label="Farmers by district">
      {names.map((d, i) => {
        const [x, y] = pos[i];
        const w = i === 2 ? 160 : 140;
        const h = i === 2 ? 170 : 100;
        const fill = i === 3 ? "#1E3A2B" : "#fff";
        return (
          <g className="district" key={d} onClick={onSelect} role="button" tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect();
            }}>
            <rect x={x} y={y} width={w} height={h} rx={14} fill={cols[i]} />
            <text x={x + 12} y={y + 26} fill={fill} fontSize={12} style={{ fontFamily: "var(--font-body), 'Public Sans', sans-serif" }}>
              {d}
            </text>
            <text x={x + 12} y={y + 62} fill={fill} fontSize={30} fontWeight={700} style={{ fontFamily: "var(--font-head), 'Bricolage Grotesque', sans-serif" }}>
              {counts[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export interface TimelineItem {
  t: string;
  s: string;
  pending?: boolean;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="timeline">
      {items.map((it, i) => (
        <div className={`tl${it.pending ? " pending" : ""}`} key={i}>
          <b>{it.t}</b>
          <small>{it.s}</small>
        </div>
      ))}
    </div>
  );
}

/** Placeholder camera tiles. */
export function CameraGrid({ cams, platform }: { cams: string[]; platform: "agri" | "minerals" }) {
  return (
    <div className="cams">
      {cams.map((c, i) => (
        <div className="cam" key={c}>
          {platform === "agri" ? (
            <svg viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
              <rect width="160" height="100" fill="#142019" />
              <rect y={55 + i * 3} width="160" height="45" fill="#1C2C22" />
              <rect x={20 + i * 12} y={35 + i * 2} width={40 + i * 4} height={30 - i} fill="#23372A" />
            </svg>
          ) : (
            <svg viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
              <rect width="160" height="100" fill="#17161E" />
              <polygon points={`0,100 ${40 + i * 8},${45 + i * 3} ${110 - i * 5},60 160,100`} fill="#2A2833" />
            </svg>
          )}
          <em className="live">SAMPLE</em>
          <span>{c}</span>
        </div>
      ))}
    </div>
  );
}

export const barStyle = (w: number): CSSProperties => ({ width: `${w}%` });
