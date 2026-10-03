"use client";

import { useSim } from "./SimContext";

/** Market ticker shown under the top bar on every module. */
export function Ticker() {
  const { cfg, sim } = useSim();
  return (
    <div className="x-tick" aria-label="Market ticker">
      {cfg.market.map((m) => {
        const a = sim.mk[m];
        const ch = (a[a.length - 1] / a[a.length - 2] - 1) * 100;
        return (
          <span key={m}>
            <b>{m}</b>
            {a[a.length - 1].toFixed(2)}{" "}
            <em className={ch >= 0 ? "x-up" : "x-dn"} style={{ fontStyle: "normal" }}>
              {ch >= 0 ? "▲" : "▼"}
              {Math.abs(ch).toFixed(2)}%
            </em>
          </span>
        );
      })}
    </div>
  );
}
