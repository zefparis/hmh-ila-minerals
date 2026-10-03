"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { PlatformCfg } from "@/data/types";
import { getSimStore, simVersion, subscribeSim, type SimState } from "@/lib/sim";
import { seedSim, simActions, tickOnce, type SimActions } from "@/lib/actions";

interface SimCtxValue {
  cfg: PlatformCfg;
  sim: SimState;
  actions: SimActions;
}

const CfgCtx = createContext<PlatformCfg | null>(null);

export function useSim(): SimCtxValue {
  const cfg = useContext(CfgCtx);
  if (!cfg) throw new Error("useSim used outside SimProvider");
  // Re-render whenever the mutable store changes.
  useSyncExternalStore(subscribeSim, simVersion, simVersion);
  return { cfg, sim: getSimStore(cfg), actions: simActions(cfg) };
}

/**
 * Provides the platform config and runs the simulated activity loop:
 * seeds 12 ledger entries once, then ticks every 2 seconds.
 */
export function SimProvider({ cfg, children }: { cfg: PlatformCfg; children: ReactNode }) {
  useEffect(() => {
    seedSim(cfg);
    const id = setInterval(() => tickOnce(cfg), 2000);
    return () => clearInterval(id);
  }, [cfg]);
  return <CfgCtx.Provider value={cfg}>{children}</CfgCtx.Provider>;
}
