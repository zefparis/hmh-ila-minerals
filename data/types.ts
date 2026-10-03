export type PlatformId = "agri" | "minerals";

export interface ModuleDef {
  id: string;
  name: string;
  group: string;
  sub?: string;
}

export interface Farmer {
  id: string;
  name: string;
  district: number;
  type: string;
  size: string;
  status: string;
  score: number;
  support: string;
}

export interface Coop {
  id: string;
  name: string;
  commodity: string;
  members: number;
  status: string;
  score: number;
}

export interface Instrument {
  type: string;
  purpose: string;
  amount: number;
  stage: number;
  flag?: string;
}

export interface Listing {
  prod: string;
  qty: string;
  who: string;
  terms: string;
  done?: boolean;
}

/** Typed equivalent of window.ILA_CFG in the prototypes. */
export interface PlatformCfg {
  id: PlatformId;
  /** Brand line in the sidebar, e.g. "HMH ILA" */
  brandName: string;
  /** Small line under the brand, e.g. "Agri & SMME platform" */
  brandTag: string;
  /** Browser title base, e.g. "HMH ILA - North West Agri Platform" */
  siteTitle: string;
  /** Label in the top bar */
  provinceLabel: string;
  homeBlurb: string;
  modules: ModuleDef[];
  defaultModule: string;

  who: string;
  whoPl: string;
  alloc: number;
  stopped: number;
  govIntro: string;
  districts: string[];
  parties: string[];
  flagged: string;
  suppliers: string[];
  txTypes: [string, number, number][];
  instruments: Instrument[];
  book: number;
  facilities: number;
  flexCap: number;
  factors: string[];
  esgIntro: string;
  esg: {
    stats: [string, string][];
    chartTitle: string;
    series: number[];
    esd: [string, number][];
    social: [string, string, string, number][];
  };
  marketIntro: string;
  market: string[];
  products: string[];
  qtyHint: string;
  listings: { buy: Listing[]; sell: Listing[] };

  farmers: Farmer[];
  coops: Coop[];
}
