import type { PlatformCfg } from "@/data/types";
import { bumpSim, fR, getSimStore, randomTxSpec, recStr, rnd, sha, tickSim, type LedgerRec } from "./sim";
import { toast } from "./toast";

export interface SimActions {
  addTx: (type: string, party: string, amount: number) => Promise<unknown>;
  verify: () => Promise<number>;
  tamper: () => Promise<number>;
  selectMarket: (i: number) => void;
  postListing: (side: "buy" | "sell", prod: string, qty: string, terms: string) => void;
  matchListing: (side: "buy" | "sell", i: number) => void;
  pay: (to: string, amt: number, rail: string) => void;
  registerFarmer: (f: { name: string; district: number; type: string; size: string }) => void;
  registerCoop: (c: { name: string; commodity: string; members: number }) => void;
  setStageFilter: (s: string) => void;
}

/**
 * Simulation actions, one set per platform. The store is module-level mutable
 * state (as in the single-file prototypes); bumpSim() notifies React to
 * re-render subscribed components.
 */
const cache = new WeakMap<PlatformCfg, SimActions>();

export function simActions(cfg: PlatformCfg): SimActions {
  const cached = cache.get(cfg);
  if (cached) return cached;

  const api: SimActions = {
    addTx(type, party, amount) {
      const sim = getSimStore(cfg);
      sim.q = sim.q.then(async () => {
        const prev = sim.ledger.length ? sim.ledger[sim.ledger.length - 1].hash : "GENESIS";
        const r: LedgerRec = {
          n: sim.ledger.length + 1,
          t: new Date().toLocaleTimeString("en-ZA"),
          type,
          party,
          amount: Math.round(amount),
          prev,
          hash: "",
        };
        r.hash = await sha(recStr(r));
        sim.ledger.push(r);
        bumpSim();
      });
      return sim.q;
    },
    async verify() {
      const sim = getSimStore(cfg);
      await sim.q;
      let prev = "GENESIS";
      for (const r of sim.ledger) {
        if (r.prev !== prev) return r.n;
        if ((await sha(recStr(r))) !== r.hash) return r.n;
        prev = r.hash;
      }
      return 0;
    },
    async tamper() {
      const sim = getSimStore(cfg);
      await sim.q;
      if (sim.ledger.length < 3) return 0;
      const r = sim.ledger[sim.ledger.length - 3];
      r.amount += 50000;
      bumpSim();
      return r.n;
    },
    selectMarket(i) {
      getSimStore(cfg).sel = i;
      bumpSim();
    },
    postListing(side, prod, qty, terms) {
      const sim = getSimStore(cfg);
      sim.listings[side].unshift({ prod, qty, who: "ILA desk (verified)", terms: terms || "Escrow" });
      bumpSim();
      toast("Listing posted to want to " + side);
      api.addTx("Listing posted (" + side + ")", "ILA desk", 0);
    },
    matchListing(side, i) {
      const sim = getSimStore(cfg);
      const l = sim.listings[side][i];
      const other = side === "buy" ? "sell" : "buy";
      const m = sim.listings[other].find((x) => !x.done && x.prod === l.prod);
      if (!m) {
        toast("No open " + (other === "sell" ? "seller" : "buyer") + " for " + l.prod + " yet");
        return;
      }
      l.done = m.done = true;
      sim.matched++;
      bumpSim();
      toast("Matched " + l.prod + ". Escrow opened, both parties notified.");
      api.addTx("Trade matched - escrow opened", m.who, rnd(80000, 900000));
    },
    pay(to, amt, rail) {
      const sim = getSimStore(cfg);
      if (amt <= 0) {
        toast("Enter an amount above zero");
        return;
      }
      if (to === cfg.flagged) {
        sim.stopped += amt;
        bumpSim();
        toast("Blocked: " + to + " has open compliance checks. Payment held.");
        api.addTx("Payment held - AML/KYC", to, amt);
        return;
      }
      sim.disbursed += amt;
      sim.volToday += amt;
      sim.payN++;
      bumpSim();
      toast(fR(amt) + " released to " + to + " via " + rail.toLowerCase() + ".");
      api.addTx("Payment released - " + rail, to, amt);
    },
    registerFarmer(f) {
      const sim = getSimStore(cfg);
      sim.farmers.unshift({
        id: "NW-F-00" + (sim.farmers.length + 231),
        name: f.name,
        district: f.district,
        type: f.type,
        size: f.size || "Not captured",
        status: "Registered",
        score: 35,
        support: "Onboarding",
      });
      sim.stageFilter = "All";
      bumpSim();
      toast("Registered " + f.name + ". Verification visit scheduled.");
    },
    registerCoop(c) {
      const sim = getSimStore(cfg);
      sim.coops.push({
        id: "NW-C-0" + (46 + sim.coops.length),
        name: c.name,
        commodity: c.commodity,
        members: c.members || 1,
        status: "Registered",
        score: 30,
      });
      bumpSim();
      toast("Registered " + c.name + ". Site verification visit scheduled.");
    },
    setStageFilter(s) {
      getSimStore(cfg).stageFilter = s;
      bumpSim();
    },
  };
  cache.set(cfg, api);
  return api;
}

/** Seed 12 random ledger entries once per session store. */
export function seedSim(cfg: PlatformCfg) {
  const sim = getSimStore(cfg);
  if (sim.seeded) return;
  sim.seeded = true;
  const api = simActions(cfg);
  for (let i = 0; i < 12; i++) {
    const t = randomTxSpec(sim, cfg);
    api.addTx(t.type, t.party, t.amount);
  }
}

/** One 2s tick: mutate the store, fire side effects, notify subscribers. */
export function tickOnce(cfg: PlatformCfg) {
  const sim = getSimStore(cfg);
  const api = simActions(cfg);
  const fx = tickSim(sim, cfg);
  if (fx.instrToast && document.getElementById("x-instr")) toast(fx.instrToast);
  if (fx.tx) api.addTx(fx.tx.type, fx.tx.party, fx.tx.amount);
  bumpSim();
}
