"use client";

import { useRef, useState, type ReactNode } from "react";
import { useSim } from "@/components/SimContext";
import { toast } from "@/components/Toast";
import { Flag, FlagText, Panel, Src, Stat, ViewHead, XPill } from "@/components/ui";
import { HBar, LiveLine, Spark, Steps } from "@/components/charts";
import { fM, fR, stagesOf } from "@/lib/sim";

/* ---------- Government dashboard ---------- */

const DIST_SPLIT = [0.31, 0.27, 0.24, 0.18];
const DIST_USED = [0.52, 0.38, 0.44, 0.29];
const DIST_VER = [0.9, 0.78, 0.86, 0.81];

export function GovDash() {
  const { cfg, sim, actions } = useSim();
  const [vres, setVres] = useState<ReactNode>(null);

  const onVerify = async () => {
    setVres("Checking " + sim.ledger.length + " records…");
    const bad = await actions.verify();
    setVres(
      bad ? (
        <span style={{ color: "var(--alert)", fontWeight: 600 }}>
          Chain broken at record {bad}. Tampering detected.
        </span>
      ) : (
        <span style={{ color: "var(--ok)", fontWeight: 600 }}>All {sim.ledger.length} records intact.</span>
      )
    );
  };
  const onTamper = async () => {
    const n = await actions.tamper();
    if (n) setVres(`Record ${n} amount changed by R 50,000. Now press Verify ledger.`);
  };

  return (
    <>
      <ViewHead title="Government dashboard">{cfg.govIntro}</ViewHead>
      <div className="grid g4">
        <Stat v={fM(sim.alloc)} l="Pre-funding budget allocated" />
        <Stat v={fM(sim.committed)} l={"Committed to approved " + cfg.whoPl} />
        <Stat v={fM(sim.disbursed)} l="Disbursed to date" />
        <Stat
          v={Math.round((sim.verified / sim.disbursed) * 100) + "%"}
          l="Disbursed funds verified on the ground"
        />
      </div>
      <div className="grid g2 mt">
        <Panel title="Disbursed versus verified, R millions">
          <LiveLine series={[sim.d, sim.v]} colors={["var(--brand)", "var(--ok)"]} area label="Disbursed versus verified" />
          <div className="x-legend">
            <span>
              <b style={{ background: "var(--brand)" }} />
              Disbursed
            </span>
            <span>
              <b style={{ background: "var(--ok)" }} />
              Verified on the ground
            </span>
          </div>
        </Panel>
        <Panel title="Budget trace by district">
          {cfg.districts.map((d, i) => {
            const a = sim.alloc * DIST_SPLIT[i];
            const u = a * DIST_USED[i];
            const vv = u * DIST_VER[i];
            return (
              <div style={{ marginBottom: 12 }} key={d}>
                <b style={{ fontSize: 14 }}>{d}</b>
                <HBar l="Disbursed" val={u} max={a} txt={fM(u) + " of " + fM(a)} />
                <HBar l="Verified" val={vv} max={a} txt={Math.round((vv / u) * 100) + "% of disbursed"} cls="v" />
              </div>
            );
          })}
        </Panel>
      </div>
      <Panel title="Audit ledger" className="mt">
        <p className="muted" style={{ marginTop: 0 }}>
          Each record carries the SHA-256 fingerprint of the record before it. If anyone changes a past payment, the
          chain breaks and the dashboard shows exactly where.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          <button className="btn" type="button" onClick={onVerify}>
            Verify ledger
          </button>
          <button className="btn ghost" type="button" onClick={onTamper}>
            Test: alter a past record
          </button>
          <span style={{ fontSize: 14 }}>{vres}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>Event</th>
                <th>Party</th>
                <th>Amount</th>
                <th>Fingerprint</th>
              </tr>
            </thead>
            <tbody id="x-ledger">
              {sim.ledger
                .slice(-8)
                .reverse()
                .map((r) => (
                  <tr key={r.n}>
                    <td>{r.n}</td>
                    <td>{r.t}</td>
                    <td>{r.type}</td>
                    <td>{r.party}</td>
                    <td>{r.amount ? fR(r.amount) : "-"}</td>
                    <td className="x-hash">{r.hash.slice(0, 16)}…</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="grid g2 mt">
        <Panel title="Compliance and audit readiness">
          {[
            "Every rand linked to a beneficiary, a purpose and proof of delivery",
            "Capture, approval and release done by different officials",
            "Tamper-evident audit trail, exportable for auditors",
            "Designed for POPIA compliance",
            "KYC, KYB and AML screening planned for every beneficiary, supplier and buyer",
            "To be reviewed against South African regulation before any deployment",
          ].map((t) => (
            <FlagText tone="ok" key={t}>
              {t}
            </FlagText>
          ))}
          <Src>Design intent, not a certification. Compliance to be confirmed with legal counsel.</Src>
        </Panel>
        <Panel title="Controls that protect government money">
          <div className="grid g2" style={{ gap: 10, marginBottom: 10 }}>
            <Stat v={fM(sim.stopped)} l="Payments stopped by controls" />
            <Stat v={String(sim.matched)} l="Trades matched this session" />
          </div>
          {[
            "Funds released in tranches against verified milestones",
            "Payments only to verified bank accounts or wallets, never cash",
            "Escrow on every sale, repayments deducted at source",
            "Duplicate and ghost beneficiary detection",
            "Supplier prices checked against benchmarks",
          ].map((t) => (
            <FlagText tone="warn" key={t}>
              {t}
            </FlagText>
          ))}
          <Src>Controls reduce risk. They do not remove it.</Src>
        </Panel>
      </div>
    </>
  );
}

/* ---------- Bank dashboard ---------- */

export function BankDash() {
  const { cfg, sim } = useSim();
  return (
    <>
      <ViewHead title="Bank dashboard">
        For partner banks and DFIs: a view of the Flex HMH credit book, trade finance instruments and repayment
        performance, with KYC, KYB and AML done before any file reaches the bank.
      </ViewHead>
      <div className="grid g4">
        <Stat v={fM(cfg.book)} l="Flex HMH facilities outstanding" />
        <Stat v={String(cfg.facilities)} l="Active facilities" />
        <Stat v={sim.rep[sim.rep.length - 1].toFixed(1) + "%"} l="Repayments on time" />
        <Stat v="2.3%" l="Book in arrears over 30 days" />
      </div>
      <Panel title="Letters of credit and financial instruments" className="mt">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Instrument</th>
                <th>Purpose</th>
                <th>Amount</th>
                <th>Progress</th>
                <th>Current stage</th>
              </tr>
            </thead>
            <tbody id="x-instr">
              {sim.instr.map((o, i) => {
                const st = stagesOf(o);
                const done = o.stage >= st.length - 1;
                return (
                  <tr key={i}>
                    <td>{o.type}</td>
                    <td>{o.purpose}</td>
                    <td>{fM(o.amount)}</td>
                    <td>
                      <Steps count={st.length} current={o.stage} />
                    </td>
                    <td>
                      <XPill v={done ? "x-ok" : o.flag ? "x-bad" : "x-wait"}>
                        {o.flag && !done ? o.flag : st[o.stage]}
                      </XPill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Src>Stages advance automatically.</Src>
      </Panel>
      <div className="grid g2 mt">
        <Panel title="Repayments on time, percent">
          <LiveLine series={[sim.rep]} colors={["var(--ok)"]} area label="Repayments on time" />
        </Panel>
        <Panel title="Flex HMH score bands">
          {([
            ["A - bankable", 22],
            ["B - bankable with conditions", 31],
            ["C - blended finance", 27],
            ["D - grant and mentorship", 14],
            ["E - not eligible", 6],
          ] as [string, number][]).map((r) => (
            <HBar key={r[0]} l={r[0]} val={r[1]} max={35} txt={r[1] + "%"} />
          ))}
          <Src>Share of scored applicants</Src>
        </Panel>
      </div>
      <Panel title="AML and fraud alerts" className="mt">
        <Flag title="Sanctions list near-match on a buyer director">
          Held for compliance officer review. No funds released.
        </Flag>
        <Flag title="Structured deposits just under reporting threshold">
          Pattern flagged for suspicious transaction review
        </Flag>
        <Flag tone="warn" title="Politically exposed person linked to an applicant">
          Enhanced due diligence opened
        </Flag>
      </Panel>
    </>
  );
}

/* ---------- Vetting and credit scoring ---------- */

const CHECKS = [
  ["y", "y", "y", "y", "y", "y"],
  ["y", "y", "y", "y", "y", "p"],
  ["y", "y", "p", "y", "y", "n"],
  ["y", "n", "y", "y", "y", "y"],
  ["y", "y", "y", "p", "y", "y"],
  ["y", "y", "y", "y", "n", "y"],
];
const MARK: Record<string, string> = { y: "✓", n: "✕", p: "…" };
const SCORE_W = [25, 25, 20, 15, 15];
const SCORE_DEFAULT = [70, 55, 80, 90, 75];

export function Vetting() {
  const { cfg } = useSim();
  const [vals, setVals] = useState<number[]>(SCORE_DEFAULT);
  const score = vals.reduce((a, v, i) => a + (v * SCORE_W[i]) / 100, 0);
  const band = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 35 ? "D" : "E";
  const lim: Record<string, number> = { A: cfg.flexCap, B: cfg.flexCap * 0.6, C: cfg.flexCap * 0.3 };
  return (
    <>
      <ViewHead title="Vetting and credit scoring">
        KYC for individuals, KYB for cooperatives and businesses, AML screening for everyone, then a Flex HMH credit
        score that decides who gets funding and how much.
      </ViewHead>
      <div className="x-pipe">
        {([
          ["Applied", 1240],
          ["Identity and business checks", 1102],
          ["AML screened", 1068],
          ["Credit scored", 934],
          ["Approved for funding", 640],
        ] as [string, number][]).map((s) => (
          <div key={s[0]}>
            <b>{s[1].toLocaleString("en-ZA")}</b>
            <small>{s[0]}</small>
          </div>
        ))}
      </div>
      <Panel title="Checks per applicant" className="mt">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>ID or CIPC</th>
                <th>Tax status</th>
                <th>Bank account</th>
                <th>Sanctions and PEP</th>
                <th>Adverse media</th>
                <th>Site visit</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {cfg.parties.slice(0, 6).map((p, i) => {
                const c = CHECKS[i];
                const bad = c.includes("n");
                const wait = c.includes("p");
                return (
                  <tr key={p}>
                    <td>{p}</td>
                    {c.map((v, j) => (
                      <td className={`x-check ${v}`} key={j}>
                        {MARK[v]}
                      </td>
                    ))}
                    <td>
                      <XPill v={bad ? "x-bad" : wait ? "x-wait" : "x-ok"}>
                        {bad ? "Blocked" : wait ? "In progress" : "Cleared"}
                      </XPill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Src>Fictional applicants</Src>
      </Panel>
      <Panel title="Flex HMH score simulator" className="mt">
        <p className="muted" style={{ marginTop: 0 }}>
          Move the sliders to see how a {cfg.who}&apos;s track record on the platform turns into access to funding.
        </p>
        {cfg.factors.map((f, i) => (
          <div className="x-range" key={f}>
            <label htmlFor={`xs${i}`}>{f}</label>
            <input
              id={`xs${i}`}
              type="range"
              min={0}
              max={100}
              value={vals[i]}
              onChange={(e) =>
                setVals((v) => v.map((x, j) => (j === i ? +e.target.value : x)))
              }
            />
            <output>{vals[i]}</output>
          </div>
        ))}
        <div className="x-score">
          <div className="big">{Math.round(score)}</div>
          <div className="x-band">Band {band}</div>
          <div>
            <b>
              {lim[band]
                ? "Eligible for up to " + fR(lim[band])
                : band === "D"
                  ? "Grant and mentorship route"
                  : "Not eligible yet"}
            </b>
            <small className="muted" style={{ display: "block" }}>
              {lim[band] ? "Flex HMH facility, repaid from platform sales" : "Improve sales and compliance record, then re-score"}
            </small>
          </div>
        </div>
        <Src>Illustrative weights and limits. Real scoring models need bank and regulator sign-off.</Src>
      </Panel>
    </>
  );
}

/* ---------- ESG, ESD and carbon ---------- */

export function Esg() {
  const { cfg } = useSim();
  return (
    <>
      <ViewHead title="ESG, ESD and carbon">{cfg.esgIntro}</ViewHead>
      <div className="grid g4">
        {cfg.esg.stats.map((s) => (
          <Stat key={s[1]} v={s[0]} l={s[1]} />
        ))}
      </div>
      <div className="grid g2 mt">
        <Panel title={cfg.esg.chartTitle}>
          <LiveLine series={[cfg.esg.series]} colors={["var(--ok)"]} area label={cfg.esg.chartTitle} fmt={(v) => v.toFixed(0)} />
        </Panel>
        <Panel title="Enterprise and supplier development spend">
          {cfg.esg.esd.map((r) => (
            <HBar key={r[0]} l={r[0]} val={r[1]} max={cfg.esg.esd[0][1]} txt={fM(r[1])} />
          ))}
        </Panel>
      </div>
      <Panel title="Social impact" className="mt">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Measure</th>
                <th>This year</th>
                <th>Target</th>
                <th style={{ minWidth: 140 }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {cfg.esg.social.map((r) => (
                <tr key={r[0]}>
                  <td>{r[0]}</td>
                  <td>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td>
                    <div className="bar">
                      <i style={{ width: `${r[3]}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Src>Structured for B-BBEE ESD and carbon disclosure reporting.</Src>
      </Panel>
    </>
  );
}

/* ---------- Market and trading ---------- */

export function Market() {
  const { cfg, sim, actions } = useSim();
  const sideRef = useRef<HTMLSelectElement>(null);
  const prodRef = useRef<HTMLSelectElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  const post = () => {
    const qty = qtyRef.current?.value.trim() || "";
    if (!qty) {
      toast("Enter a quantity to post");
      qtyRef.current?.focus();
      return;
    }
    actions.postListing(
      (sideRef.current?.value as "buy" | "sell") || "buy",
      prodRef.current?.value || cfg.products[0],
      qty,
      termsRef.current?.value.trim() || ""
    );
    if (qtyRef.current) qtyRef.current.value = "";
  };

  const sel = cfg.market[sim.sel];

  return (
    <>
      <ViewHead title="Market and trading">{cfg.marketIntro}</ViewHead>
      <div className="x-cards">
        {cfg.market.map((m, i) => {
          const a = sim.mk[m];
          const ch = (a[a.length - 1] / a[0] - 1) * 100;
          return (
            <button
              className="x-card"
              key={m}
              type="button"
              aria-pressed={i === sim.sel}
              onClick={() => actions.selectMarket(i)}
            >
              <small>{m}</small>
              <div className="v">{a[a.length - 1].toFixed(2)}</div>
              <span className={ch >= 0 ? "x-up" : "x-dn"} style={{ fontSize: 13 }}>
                {ch >= 0 ? "▲" : "▼"} {Math.abs(ch).toFixed(2)}%
              </span>
              <Spark s={a.slice(-30)} up={ch >= 0} />
            </button>
          );
        })}
      </div>
      <Panel title={sel + " - index, base 100"} className="mt">
        <LiveLine series={[sim.mk[sel]]} colors={["var(--brand)"]} area label={sel + " index"} />
      </Panel>
      <Panel title="Post to the board" className="mt">
        <div className="form">
          <label>
            I want to
            <select ref={sideRef} defaultValue="buy">
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </label>
          <label>
            Product
            <select ref={prodRef} defaultValue={cfg.products[0]}>
              {cfg.products.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Quantity
            <input ref={qtyRef} placeholder={cfg.qtyHint} />
          </label>
          <label>
            Price or terms
            <input ref={termsRef} placeholder="e.g. escrow, FCA hub" />
          </label>
          <button className="btn alt" type="button" onClick={post}>
            Post listing
          </button>
        </div>
        <Src>Only KYC-verified parties can post. Posts are made as a verified ILA desk user.</Src>
      </Panel>
      <div className="x-cols mt">
        {(["buy", "sell"] as const).map((side) => (
          <Panel title={side === "buy" ? "Want to buy" : "Want to sell"} key={side}>
            <div className="x-list">
              {sim.listings[side].map((l, i) => (
                <div className="it" key={i}>
                  <div>
                    <b>{l.prod}</b> {l.qty}
                    <small>
                      {l.who} - {l.terms}
                    </small>
                  </div>
                  {l.done ? (
                    <XPill v="x-ok">Matched</XPill>
                  ) : (
                    <button className="btn ghost" type="button" onClick={() => actions.matchListing(side, i)}>
                      Match
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}

/* ---------- Payments gateway ---------- */

export function Gateway() {
  const { cfg, sim, actions } = useSim();
  const toRef = useRef<HTMLSelectElement>(null);
  const amtRef = useRef<HTMLInputElement>(null);
  const railRef = useRef<HTMLSelectElement>(null);

  const pay = () => {
    actions.pay(toRef.current?.value || cfg.parties[0], +(amtRef.current?.value || 0), railRef.current?.value || "");
  };

  return (
    <>
      <ViewHead title="Payments gateway">
        {"One gateway for every payment on the platform: pre-funding, supplier vouchers, buyer escrow, loan repayments and payouts to " +
          cfg.whoPl +
          ". Designed to connect to banks through one payment gateway."}
      </ViewHead>
      <div className="grid g4">
        <Stat v={fM(sim.volToday)} l="Processed this session" />
        <Stat v={String(sim.payN)} l="Payments this session" />
        <Stat v="11 sec" l="Average instant payment settlement" />
        <Stat v="0.4%" l="Payments failed or reversed" />
      </div>
      <div className="grid g2 mt">
        <Panel title="Payment volume, R millions per interval">
          <LiveLine series={[sim.vol]} colors={["var(--sky)"]} area label="Payment volume" />
        </Panel>
        <Panel title="Gateway security">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Bank integration", "Not connected"],
                  ["Response time", sim.gw.resp],
                  ["Encryption", "End to end, tokenised account and card data"],
                  ["Strong customer authentication", "One-time PIN and device checks"],
                  ["Fraud monitoring", sim.gw.fraud],
                  ["Uptime", sim.gw.up],
                ].map((r) => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td>{r[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      <Panel title="Release a payment" className="mt">
        <div className="form">
          <label>
            Pay to
            <select ref={toRef} defaultValue={cfg.parties[0]}>
              {cfg.parties.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Amount (R)
            <input ref={amtRef} type="number" defaultValue={25000} />
          </label>
          <label>
            Rail
            <select ref={railRef} defaultValue="Instant payment">
              <option>Instant payment</option>
              <option>EFT</option>
              <option>Mobile wallet</option>
              <option>Escrow release</option>
            </select>
          </label>
          <button className="btn alt" type="button" onClick={pay}>
            Release payment
          </button>
        </div>
        <Src>Every release runs KYC and AML checks first and is written to the audit ledger.</Src>
      </Panel>
      <Panel title="Payment models" className="mt">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>How it works</th>
                <th>Protects</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Milestone tranches</td>
                <td>Pre-funding released only when the previous tranche is verified</td>
                <td>Government budget</td>
              </tr>
              <tr>
                <td>Closed-loop vouchers</td>
                <td>Support spent only with approved suppliers, not withdrawn as cash</td>
                <td>Government budget</td>
              </tr>
              <tr>
                <td>Buyer escrow</td>
                <td>Buyer pays first, seller paid on proof of delivery</td>
                <td>Sellers and buyers</td>
              </tr>
              <tr>
                <td>Deduction at source</td>
                <td>Loan repayments and royalties taken from sale proceeds automatically</td>
                <td>Banks and the state</td>
              </tr>
              <tr>
                <td>Split payouts</td>
                <td>Cooperative proceeds split to each member&apos;s account</td>
                <td>{cfg.whoPl[0].toUpperCase() + cfg.whoPl.slice(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
