"use client";

import { useRef, useState } from "react";
import { useSim } from "@/components/SimContext";
import { toast } from "@/components/Toast";
import { Bar, Flag, FlagText, Panel, Pill, Src, Stat, ViewHead } from "@/components/ui";
import { CameraGrid, MonthBars, Timeline } from "@/components/charts";
import { fR } from "@/lib/sim";

const COOP_STATUS: Record<string, string> = {
  Exporting: "p-dark",
  "Selling locally": "p-ok",
  Verified: "p-ok",
  "Permit pending": "p-wait",
  Registered: "p-new",
};

const LOT_STAGES = [
  "Mined and declared",
  "Weighed and sealed at hub",
  "Assayed",
  "Regulator cleared",
  "Sold to buyer",
  "Shipped",
  "Miners paid",
];

interface Lot {
  id: string;
  coop: number;
  commodity: string;
  qty: string;
  grade: string;
  stage: number;
}

const LOTS: Lot[] = [
  { id: "LOT-2291", coop: 0, commodity: "Chrome ore", qty: "1,200 t", grade: "40-42% Cr2O3", stage: 5 },
  { id: "LOT-2292", coop: 1, commodity: "Alluvial diamonds", qty: "38.4 ct", grade: "Mixed, valued", stage: 3 },
  { id: "LOT-2293", coop: 3, commodity: "Dimension stone", qty: "64 blocks", grade: "Grade A", stage: 4 },
  { id: "LOT-2294", coop: 0, commodity: "Chrome ore", qty: "900 t", grade: "Assay pending", stage: 1 },
];

const CUSTODY_NOTES = [
  "Site geo-tag and cooperative declaration",
  "Weighbridge 1,200 t, seal numbers logged, camera verified",
  "Accredited lab result 41.2% Cr2O3",
  "Export documents approved",
  "Sold to verified importer, China",
  "Loaded at port, bill of lading recorded",
  "Released on buyer payment into escrow",
];

const BUYERS = [
  { name: "Stainless steel producer", country: "China", want: "Chrome ore, 5,000 t per month", kyc: "Verified", route: "Export" },
  { name: "Ferrochrome smelter", country: "South Africa", want: "Chrome ore, 2,000 t per month", kyc: "Verified", route: "Local" },
  { name: "Industrial minerals trader", country: "USA", want: "Fluorspar, 800 t quarterly", kyc: "Verified", route: "Export" },
  { name: "Precious metals refiner", country: "South Africa", want: "Gold dore from licensed sources", kyc: "Verified", route: "Local" },
  { name: "Bullion trading house", country: "UAE", want: "Gold, any volume", kyc: "Enhanced due diligence", route: "Export" },
  { name: "Stone importer", country: "China", want: "Dimension stone, 200 blocks", kyc: "KYC pending", route: "Export" },
];

const COMMODITIES = [
  "Chrome ore",
  "Alluvial diamonds",
  "Gold (tailings)",
  "Dimension stone",
  "Aggregates",
  "Fluorspar",
];

export function MinOverview() {
  const { sim } = useSim();
  const coops = sim.coops;
  return (
    <>
      <section className="hero">
        <h1>From the digger to the importer, every tonne accounted for.</h1>
        <p>
          Small-scale miners join a registered cooperative. The cooperative aggregates, grades and sells through one
          compliant channel - to local smelters and refiners first, and to verified importers in China, the USA and
          other markets. Money flows back the same way, with royalties collected and miners paid on proof of sale.
        </p>
        <div className="chain">
          {[
            ["Miner", "Registered, permitted site"],
            ["Cooperative", "Declares output, pools volume"],
            ["Aggregation hub", "Weigh, sample, seal"],
            ["Assay and clearance", "Lab grade, regulator approval"],
            ["Buyer", "Local beneficiation or export"],
            ["Payment", "Escrow, royalty, coop, miners"],
          ].map((s, i) => (
            <div className="link" key={s[0]}>
              <span className="n">{i + 1}</span>
              <b>{s[0]}</b>
              <small>{s[1]}</small>
            </div>
          ))}
        </div>
        <div className="money">
          Money moves in reverse: buyer pays into escrow, the platform deducts royalty, logistics and finance, and pays
          each miner&apos;s share by bank or mobile wallet.
        </div>
      </section>
      <div className="grid g4">
        <Stat v={coops.length} l="Cooperatives on the platform" />
        <Stat v={coops.reduce((a, c) => a + c.members, 0)} l="Registered miners" />
        <Stat v="R 41.6m" l="Sales through the channel this year" />
        <Stat v="R 1.9m" l="Royalties and levies captured" />
      </div>
      <div className="grid g2 mt">
        <Panel title="What leadership sees">
          <Flag tone="ok" title="1,200 t chrome shipped to a verified importer">
            86 miners paid within 5 days of buyer payment
          </Flag>
          <Flag tone="warn" title="Gold tailings cooperative waiting on permit">
            Licences and compliance, 64 miners cannot sell legally until approved
          </Flag>
          <Flag title="Declared volume 30 percent above site capacity">
            Chain of custody, possible outside material, lot frozen for inspection
          </Flag>
          <Flag tone="warn" title="Buyer requires enhanced due diligence">
            Buyers and trade, gold sale blocked until source and funds are verified
          </Flag>
        </Panel>
        <Panel title="Why a cooperative channel">
          <p className="muted" style={{ marginTop: 0 }}>
            Individual small miners cannot meet buyer volumes, assay requirements or compliance checks. A cooperative
            can - if every lot is traceable. That traceability is what keeps illegal material out and lets the province
            prove the channel is clean.
          </p>
          <Flag tone="ok" title="For the MEC for Finance">
            Royalties, tax and levies captured at source, not lost to informal trade
          </Flag>
          <Flag tone="ok" title="For economic development">
            Registered SMMEs, jobs, and local beneficiation before export
          </Flag>
          <Flag tone="ok" title="For miners">
            Fair grading, better prices through pooled volume, safer paid work
          </Flag>
        </Panel>
      </div>
    </>
  );
}

export function MinCoop() {
  const { sim, actions } = useSim();
  const nameRef = useRef<HTMLInputElement>(null);
  const comRef = useRef<HTMLSelectElement>(null);
  const memRef = useRef<HTMLInputElement>(null);
  const register = () => {
    const name = nameRef.current?.value.trim() || "";
    if (!name) {
      toast("Enter a cooperative name to register");
      return;
    }
    actions.registerCoop({
      name,
      commodity: comRef.current?.value || "Chrome ore",
      members: parseInt(memRef.current?.value || "") || 1,
    });
  };
  return (
    <>
      <ViewHead title="Cooperative registry">
        Register cooperatives and their members once. Every miner is identified, every site is mapped, and every
        cooperative has a score that tells buyers and funders whether it is ready to trade.
      </ViewHead>
      <Panel title="Register a cooperative">
        <div className="form">
          <label>
            Cooperative name
            <input ref={nameRef} placeholder="e.g. Taung Minerals Co-op" />
          </label>
          <label>
            Main commodity
            <select ref={comRef} defaultValue="Chrome ore">
              {COMMODITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Members
            <input ref={memRef} type="number" min={1} placeholder="e.g. 30" />
          </label>
          <button className="btn alt" type="button" onClick={register}>
            Register cooperative
          </button>
        </div>
      </Panel>
      <Panel title="Cooperative register" className="mt">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cooperative</th>
                <th>Commodity</th>
                <th>Members</th>
                <th>Stage</th>
                <th>Trade readiness</th>
              </tr>
            </thead>
            <tbody>
              {sim.coops.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.commodity}</td>
                  <td>{c.members}</td>
                  <td>
                    <Pill v={COOP_STATUS[c.status] || "p-new"}>{c.status}</Pill>
                  </td>
                  <td style={{ minWidth: 110 }}>
                    <Bar pct={c.score} label={`${c.score}/100`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Src>Fictional cooperatives and figures</Src>
      </Panel>
    </>
  );
}

export function MinPermit() {
  return (
    <>
      <ViewHead title="Licences and compliance">
        Track every licence a cooperative needs before it can sell. No valid permit, no sale - the platform enforces
        it.
      </ViewHead>
      <Panel title="What each commodity needs">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Commodity</th>
                <th>Key requirements</th>
                <th>Authority</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rough diamonds</td>
                <td>Mining permit, diamond licence, sale or export through the regulator&apos;s controlled channel</td>
                <td>DMPR, SADPMR</td>
              </tr>
              <tr>
                <td>Gold and PGMs</td>
                <td>Mining permit, precious metals licence, export authorisation for unwrought metal</td>
                <td>DMPR, SADPMR</td>
              </tr>
              <tr>
                <td>Chrome, fluorspar, stone</td>
                <td>Mining permit, environmental authorisation, export documentation</td>
                <td>DMPR, environmental authority, SARS</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Src>Confirm exact current requirements with DMPR and SADPMR before any deployment.</Src>
      </Panel>
      <Panel title="Compliance status by cooperative" className="mt">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cooperative</th>
                <th>Mining permit</th>
                <th>Environmental</th>
                <th>Trade licence</th>
                <th>Can sell</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bophirima Chrome Miners</td>
                <td>
                  <Pill v="p-ok">Valid</Pill>
                </td>
                <td>
                  <Pill v="p-ok">Valid</Pill>
                </td>
                <td>
                  <Pill v="p-ok">N/A</Pill>
                </td>
                <td>
                  <b>Yes</b>
                </td>
              </tr>
              <tr>
                <td>Lichtenburg Alluvial Diggers</td>
                <td>
                  <Pill v="p-ok">Valid</Pill>
                </td>
                <td>
                  <Pill v="p-ok">Valid</Pill>
                </td>
                <td>
                  <Pill v="p-ok">Valid</Pill>
                </td>
                <td>
                  <b>Yes</b>
                </td>
              </tr>
              <tr>
                <td>Matlosana Tailings</td>
                <td>
                  <Pill v="p-wait">Submitted</Pill>
                </td>
                <td>
                  <Pill v="p-wait">In review</Pill>
                </td>
                <td>
                  <Pill v="p-bad">Missing</Pill>
                </td>
                <td>
                  <b>No</b>
                </td>
              </tr>
              <tr>
                <td>Moretele Aggregates</td>
                <td>
                  <Pill v="p-bad">Expired</Pill>
                </td>
                <td>
                  <Pill v="p-ok">Valid</Pill>
                </td>
                <td>
                  <Pill v="p-ok">N/A</Pill>
                </td>
                <td>
                  <b>No</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

export function MinAssay() {
  return (
    <>
      <ViewHead title="Sampling and grading">
        Sample every lot at the hub, send it to an accredited lab, and publish the grade to the cooperative and the
        buyer at the same time. Grading disputes drop when both sides see the same result.
      </ViewHead>
      <div className="grid g3">
        <Stat v="46" l="Lots assayed this month" />
        <Stat v="2.1 days" l="Average lab turnaround" />
        <Stat v="3" l="Grade disputes raised" />
      </div>
      <Panel title="Latest results" className="mt">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lot</th>
                <th>Commodity</th>
                <th>Result</th>
                <th>Price basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>LOT-2291</td>
                <td>Chrome ore</td>
                <td>41.2% Cr2O3</td>
                <td>Buyer grade band 40-42%</td>
              </tr>
              <tr>
                <td>LOT-2292</td>
                <td>Alluvial diamonds</td>
                <td>Valued by accredited valuator</td>
                <td>Regulator-controlled sale</td>
              </tr>
              <tr>
                <td>LOT-2293</td>
                <td>Dimension stone</td>
                <td>Grade A, no fractures</td>
                <td>Per block</td>
              </tr>
              <tr>
                <td>LOT-2294</td>
                <td>Chrome ore</td>
                <td>
                  <Pill v="p-wait">At lab</Pill>
                </td>
                <td>Pending</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

export function MinChain() {
  const { sim } = useSim();
  return (
    <>
      <ViewHead title="Chain of custody">
        Chain of custody from the site to the ship. Each lot is weighed, sealed, photographed and tracked, so buyers
        in China, the USA or locally can prove where the material came from.
      </ViewHead>
      <div className="grid g2">
        <Panel title="Lots in the pipeline">
          {LOTS.map((l) => (
            <div style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }} key={l.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <b>
                  {l.id} - {l.commodity}
                </b>
                <span className="muted">{l.qty}</span>
              </div>
              <small className="muted">
                {sim.coops[l.coop]?.name}, stage: {LOT_STAGES[l.stage]}
              </small>
              <div className="bar" style={{ marginTop: 6 }}>
                <i style={{ width: `${((l.stage + 1) / LOT_STAGES.length) * 100}%` }} />
              </div>
            </div>
          ))}
        </Panel>
        <Panel title="LOT-2291 custody record">
          <Timeline
            items={LOT_STAGES.map((s, i) => ({
              t: s,
              s: CUSTODY_NOTES[i],
              pending: i > LOTS[0].stage,
            }))}
          />
        </Panel>
      </div>
    </>
  );
}

export function MinTrade() {
  const [sent, setSent] = useState<number[]>([]);
  return (
    <>
      <ViewHead title="Buyers and trade">
        Match cooperative output with verified buyers. Local smelters and refiners get first sight to support
        beneficiation. Importers from China, the USA and other markets trade only after their identity and funds are
        verified.
      </ViewHead>
      <div className="grid g3">
        <Stat v="6" l="Buyers on the book" />
        <Stat v="64%" l="Volume sold to local beneficiators" />
        <Stat v="100%" l="Sales with escrow payment" />
      </div>
      <Panel title="Buyer book" className="mt">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Buyer type</th>
                <th>Country</th>
                <th>Demand</th>
                <th>Route</th>
                <th>KYC and funds</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {BUYERS.map((b, i) => {
                const canOffer = b.kyc === "Verified" && !sent.includes(i);
                return (
                  <tr key={b.name}>
                    <td>{b.name}</td>
                    <td>{b.country}</td>
                    <td>{b.want}</td>
                    <td>{b.route}</td>
                    <td>
                      <Pill v={b.kyc === "Verified" ? "p-ok" : b.kyc === "KYC pending" ? "p-wait" : "p-bad"}>
                        {b.kyc}
                      </Pill>
                    </td>
                    <td>
                      <button
                        className="btn ghost"
                        type="button"
                        disabled={!canOffer}
                        onClick={() => {
                          setSent((s) => [...s, i]);
                          toast("Offer sent to " + b.name.toLowerCase() + " (" + b.country + "). Escrow terms attached.");
                        }}
                      >
                        {sent.includes(i) ? "Offer sent" : "Send offer"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Src>Buyer types are illustrative. No real companies named.</Src>
      </Panel>
    </>
  );
}

export function MinFinance() {
  const [w, setW] = useState({ sale: 4800000, roy: 3, log: 12, coop: 8, fin: 10 });
  const roy = (w.sale * w.roy) / 100;
  const log = (w.sale * w.log) / 100;
  const coop = (w.sale * w.coop) / 100;
  const fin = (w.sale * w.fin) / 100;
  const miners = w.sale - roy - log - coop - fin;
  const rows: [string, number][] = [
    ["Buyer pays into escrow", w.sale],
    ["Royalty to the state", -roy],
    ["Logistics and port", -log],
    ["Cooperative fee", -coop],
    ["Finance repayment", -fin],
    ["Paid to miners", miners],
  ];
  const num = (v: string) => parseFloat(v) || 0;
  return (
    <>
      <ViewHead title="Funds and royalties">
        For the MEC for Finance: every sale pays into escrow, royalties and levies are deducted at source, and miners
        are paid their share directly. Pre-export finance lets cooperatives get paid before the ship sails.
      </ViewHead>
      <div className="grid g2">
        <Panel title="Payment waterfall calculator">
          <div className="form" style={{ marginBottom: 12 }}>
            <label>
              Sale value (R)
              <input
                type="number"
                value={w.sale}
                onChange={(e) => setW({ ...w, sale: num(e.target.value) })}
              />
            </label>
            <label>
              Royalty %
              <input type="number" step={0.1} value={w.roy} onChange={(e) => setW({ ...w, roy: num(e.target.value) })} />
            </label>
            <label>
              Logistics %
              <input type="number" step={0.1} value={w.log} onChange={(e) => setW({ ...w, log: num(e.target.value) })} />
            </label>
            <label>
              Cooperative fee %
              <input
                type="number"
                step={0.1}
                value={w.coop}
                onChange={(e) => setW({ ...w, coop: num(e.target.value) })}
              />
            </label>
            <label>
              Finance repayment %
              <input type="number" step={0.1} value={w.fin} onChange={(e) => setW({ ...w, fin: num(e.target.value) })} />
            </label>
          </div>
          <div className="wf">
            {rows.map((r) => (
              <div className="row" key={r[0]}>
                <span>{r[0]}</span>
                <span style={r[1] < 0 ? { color: "var(--alert)" } : undefined}>{fR(r[1])}</span>
              </div>
            ))}
            {miners < 0 ? (
              <p style={{ color: "var(--alert)" }}>Deductions exceed the sale value. Lower the percentages.</p>
            ) : null}
          </div>
          <Src>
            Illustrative rates only. Actual royalty is set by legislation and depends on the mineral and whether it is
            refined.
          </Src>
        </Panel>
        <Panel title="Control checks">
          <Flag title="Buyer payment from a third-party account">Held until the source of funds is confirmed</Flag>
          <Flag tone="warn" title="Miner bank details changed 2 days before payout">Verification call required</Flag>
          <Flag tone="ok" title="Royalty remitted for LOT-2291">Proof of payment attached to the lot record</Flag>
          <h2 className="mt">Funding instruments</h2>
          <FlagText tone="ok">
            <b>Pre-export finance</b>
            <small className="muted" style={{ display: "block" }}>
              Advance against a verified offtake contract
            </small>
          </FlagText>
          <FlagText tone="ok">
            <b>Equipment finance</b>
            <small className="muted" style={{ display: "block" }}>
              Safer, mechanised mining for cooperatives with a trading record
            </small>
          </FlagText>
          <Src>Illustrative structure for discussion</Src>
        </Panel>
      </div>
    </>
  );
}

export function MinSight() {
  return (
    <>
      <ViewHead title="Prices and risk">
        Commodity prices, volumes and risk on one screen, so cooperatives know when to sell and the province sees the
        real value of small-scale mining.
      </ViewHead>
      <div className="grid g2">
        <Panel title="Monthly sales through the channel, R millions">
          <MonthBars labels={["Apr", "May", "Jun", "Jul", "Aug", "Sep"]} v={[3.1, 4.4, 5.2, 6.8, 8.9, 13.2]} />
        </Panel>
        <Panel title="Risk watch">
          <Flag title="Illegal mining pressure">
            Unregistered material trying to enter the channel is the main integrity risk. Volume-to-capacity checks and
            hub cameras flag it.
          </Flag>
          <Flag tone="warn" title="Buyer concentration">
            Most chrome volume goes to one export market. Price or policy change there hits every miner.
          </Flag>
          <Flag tone="warn" title="Mine safety">
            Incidents are logged per site and block a cooperative&apos;s sales until resolved.
          </Flag>
          <Src>Illustrative risk items. No live prices shown.</Src>
        </Panel>
      </div>
    </>
  );
}

const MIN_CAMS = [
  "Aggregation hub weighbridge",
  "Sealed lot store",
  "Chrome stockpile",
  "Assay sample room",
  "Hub gate",
  "Loading bay",
];

export function MinShield() {
  return (
    <>
      <ViewHead title="Site security">
        HMH-integrated cameras, access control and AI alerts at hubs, stockpiles and weighbridges. The footage is part
        of the custody record, which is what buyers and regulators need to trust the channel.
      </ViewHead>
      <div className="grid g4">
        <Stat v="64" l="Cameras connected" />
        <Stat v="9" l="Hubs and stockpiles protected" />
        <Stat v="3 min" l="Alert to response" />
        <Stat v="0" l="Seal breaches this quarter" />
      </div>
      <Panel title="Sample sites" className="mt">
        <CameraGrid cams={MIN_CAMS} platform="minerals" />
        <Src>Placeholder feeds</Src>
      </Panel>
      <Panel title="Recent events" className="mt">
        <Flag title="Vehicle at weighbridge without booking">
          Load refused, plate logged, cooperative notified
        </Flag>
        <Flag tone="warn" title="Night movement near chrome stockpile">
          Patrol dispatched, stockpile volume checked by drone survey
        </Flag>
      </Panel>
    </>
  );
}
