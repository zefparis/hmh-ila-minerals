"use client";

import { useSyncExternalStore } from "react";
import { getCurrency, setCurrency, simVersion, subscribeSim, ZAR_PER_USD } from "@/lib/sim";

export function CurrencyButton() {
  // Re-render when the display currency (or any sim state) changes.
  useSyncExternalStore(subscribeSim, simVersion, simVersion);
  const cur = getCurrency();
  return (
    <button
      className="theme-btn"
      type="button"
      title={"Amounts shown in " + cur + ". Indicative rate: R " + ZAR_PER_USD + " = $1."}
      onClick={() => {
        const next = cur === "ZAR" ? "USD" : "ZAR";
        try {
          localStorage.setItem("ila-currency", next);
        } catch {
          /* storage unavailable */
        }
        setCurrency(next);
      }}
    >
      {cur === "ZAR" ? "R ZAR" : "$ USD"}
    </button>
  );
}
