import type { ComponentType } from "react";
import { BankDash, Esg, Gateway, InvestorDash, Market, Vetting } from "./shared";
import {
  MinAssay,
  MinChain,
  MinCoop,
  MinFinance,
  MinOverview,
  MinPermit,
  MinShield,
  MinSight,
  MinTrade,
} from "./minerals";

export const MODULES: Record<string, ComponentType> = {
  overview: MinOverview,
  investor: InvestorDash,
  bank: BankDash,
  finance: MinFinance,
  coop: MinCoop,
  permit: MinPermit,
  assay: MinAssay,
  chain: MinChain,
  trade: MinTrade,
  sight: MinSight,
  shield: MinShield,
  vetting: Vetting,
  esg: Esg,
  market: Market,
  gateway: Gateway,
};
