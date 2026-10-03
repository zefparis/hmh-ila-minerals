import type { Coop, Farmer, Instrument, Listing, PlatformCfg } from "@/data/types";

export interface LedgerRec {
  n: number;
  t: string;
  type: string;
  party: string;
  amount: number;
  prev: string;
  hash: string;
}

export interface GatewayFeed {
  resp: string;
  fraud: string;
  up: string;
}

export interface SimState {
  seeded: boolean;
  q: Promise<unknown>;
  alloc: number;
  committed: number;
  disbursed: number;
  verified: number;
  stopped: number;
  ledger: LedgerRec[];
  d: number[];
  v: number[];
  vol: number[];
  rep: number[];
  mk: Record<string, number[]>;
  sel: number;
  payN: number;
  volToday: number;
  matched: number;
  instr: Instrument[];
  listings: { buy: Listing[]; sell: Listing[] };
  farmers: Farmer[];
  coops: Coop[];
  stageFilter: string;
  gw: GatewayFeed;
  tk: number;
}

/** Deterministic PRNG so the server-rendered and hydrated markup match. */
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rnd = (a: number, b: number) => a + Math.random() * (b - a);
export const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export const fR = (n: number) => "R " + Math.round(n).toLocaleString("en-ZA");
export const fM = (n: number) => "R " + (n / 1e6).toFixed(1) + "m";

export const LC = ["Applied", "Issued", "Goods shipped", "Documents presented", "Documents compliant", "Paid"];
export const GEN = ["Applied", "Approved", "Active", "Drawn", "Repaying", "Closed"];
export const stagesOf = (o: { type: string }) => (/credit/i.test(o.type) ? LC : GEN);

export function createSimState(cfg: PlatformCfg): SimState {
  const R = mulberry32(20261001);
  const dr = (a: number, b: number) => a + R() * (b - a);
  const S: SimState = {
    seeded: false,
    q: Promise.resolve(),
    alloc: cfg.alloc,
    committed: cfg.alloc * 0.62,
    disbursed: cfg.alloc * 0.41,
    verified: 0,
    stopped: cfg.stopped,
    ledger: [],
    d: [],
    v: [],
    vol: [],
    rep: [],
    mk: {},
    sel: 0,
    payN: 0,
    volToday: 0,
    matched: 0,
    instr: cfg.instruments.map((o) => ({ ...o })),
    listings: {
      buy: cfg.listings.buy.map((x) => ({ ...x })),
      sell: cfg.listings.sell.map((x) => ({ ...x })),
    },
    farmers: cfg.farmers.map((f) => ({ ...f })),
    coops: cfg.coops.map((c) => ({ ...c })),
    stageFilter: "All",
    gw: {
      resp: "214 ms (fictional)",
      fraud: "612 transactions per minute (fictional)",
      up: "99.95% (fictional)",
    },
    tk: 0,
  };
  S.verified = S.disbursed * 0.84;
  for (let i = 0; i < 40; i++) {
    const f = 0.8 + i * 0.005;
    S.d.push((S.disbursed * f) / 1e6);
    S.v.push((S.disbursed * f * dr(0.8, 0.86)) / 1e6);
    S.vol.push(dr(0.6, 2.2));
    S.rep.push(dr(93, 98));
  }
  cfg.market.forEach((m) => {
    let x = 100;
    const a: number[] = [];
    for (let i = 0; i < 50; i++) {
      x *= 1 + dr(-0.006, 0.0062);
      a.push(x);
    }
    S.mk[m] = a;
  });
  return S;
}

/**
 * One store per platform config, kept at module scope so it behaves like the
 * prototype's page-level closure state: it persists across module navigation
 * and resets on a full page load.
 */
const stores = new WeakMap<PlatformCfg, SimState>();
export function getSimStore(cfg: PlatformCfg): SimState {
  let s = stores.get(cfg);
  if (!s) {
    s = createSimState(cfg);
    stores.set(cfg, s);
  }
  return s;
}

/* ---------- pub/sub so React knows when the mutable store changed ---------- */

let simVer = 0;
const listeners = new Set<() => void>();

export function subscribeSim(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
export function simVersion(): number {
  return simVer;
}
export function bumpSim(): void {
  simVer++;
  listeners.forEach((f) => f());
}

/* ---------- tamper-evident ledger ---------- */

export async function sha(s: string): Promise<string> {
  try {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  } catch {
    let h = 5381;
    for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
    return (h >>> 0).toString(16).padStart(8, "0").repeat(8);
  }
}

export const recStr = (r: LedgerRec) => [r.n, r.t, r.type, r.party, r.amount, r.prev].join("|");

/** Pick a random ledger event and apply its disbursal side effect. */
export function randomTxSpec(S: SimState, cfg: PlatformCfg) {
  const [type, a, b] = pick(cfg.txTypes);
  const party = /supplier/i.test(type) ? pick(cfg.suppliers) : pick(cfg.parties);
  const amount = b ? rnd(a, b) : 0;
  if (/disburs|voucher/i.test(type)) {
    S.disbursed += amount;
    S.verified += amount * rnd(0.6, 0.95);
  }
  return { type, party, amount };
}

export interface TickFx {
  tx?: { type: string; party: string; amount: number };
  instrToast?: string;
}

/** One 2-second simulation step. Mutates S; returns side effects for the caller. */
export function tickSim(S: SimState, cfg: PlatformCfg): TickFx {
  S.tk++;
  cfg.market.forEach((m) => {
    const a = S.mk[m];
    a.push(a[a.length - 1] * (1 + rnd(-0.006, 0.0062)));
    if (a.length > 60) a.shift();
  });
  const inc = rnd(40000, 260000);
  S.disbursed += inc;
  S.verified += inc * rnd(0.72, 0.93);
  S.d.push(S.disbursed / 1e6);
  S.v.push(S.verified / 1e6);
  S.d.shift();
  S.v.shift();
  const vol = rnd(0.4, 2.4);
  S.vol.push(vol);
  S.vol.shift();
  S.volToday += vol * 1e6;
  S.payN += Math.round(rnd(3, 14));
  S.rep.push(Math.min(99.5, Math.max(90, S.rep[S.rep.length - 1] + rnd(-0.8, 0.8))));
  S.rep.shift();
  if (Math.random() < 0.15) S.stopped += rnd(8000, 90000);
  S.gw = {
    resp: Math.round(rnd(90, 380)) + " ms (fictional)",
    fraud: Math.round(rnd(400, 900)) + " transactions per minute (fictional)",
    up: (99.9 + rnd(0, 0.09)).toFixed(2) + "% (fictional)",
  };
  const fx: TickFx = {};
  if (S.tk % 2 === 0) fx.tx = randomTxSpec(S, cfg);
  if (Math.random() < 0.12) {
    const o = pick(S.instr);
    const st = stagesOf(o);
    if (o.stage < st.length - 1 && !o.flag) {
      o.stage++;
      fx.instrToast = o.type + " moved to: " + st[o.stage];
    }
  }
  return fx;
}
