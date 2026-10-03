import type { ReactNode } from "react";

export function ViewHead({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="view-head">
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}

export function Panel({
  title,
  className = "",
  children,
}: {
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`panel ${className}`.trim()}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </div>
  );
}

export function Stat({ v, l, src }: { v: ReactNode; l: string; src?: string }) {
  return (
    <div className="panel stat">
      <div className="v">{v}</div>
      <div className="l">{l}</div>
      {src ? <Src>{src}</Src> : null}
    </div>
  );
}

export function Src({ children }: { children: ReactNode }) {
  return <div className="src">{children}</div>;
}

export function Flag({
  tone,
  title,
  children,
  src,
}: {
  tone?: "warn" | "ok";
  title: ReactNode;
  children?: ReactNode;
  src?: string;
}) {
  return (
    <div className="flag">
      <span className={`ic${tone === "warn" ? " w" : tone === "ok" ? " g" : ""}`} />
      <div>
        <b>{title}</b>
        {children ? <small>{children}</small> : null}
        {src ? <Src>{src}</Src> : null}
      </div>
    </div>
  );
}

/** Plain-text flag row used for compliance/control lists (no title/small split). */
export function FlagText({ tone, children }: { tone?: "warn" | "ok"; children: ReactNode }) {
  return (
    <div className="flag">
      <span className={`ic${tone === "warn" ? " w" : tone === "ok" ? " g" : ""}`} />
      <div>{children}</div>
    </div>
  );
}

export function Pill({ v, children }: { v: string; children: ReactNode }) {
  return <span className={`pill ${v}`}>{children}</span>;
}

export function XPill({ v, children }: { v: string; children: ReactNode }) {
  return <span className={`x-pill ${v}`}>{children}</span>;
}

export function Bar({ pct, label }: { pct: number; label?: string }) {
  return (
    <>
      <div className="bar">
        <i style={{ width: `${pct}%` }} />
      </div>
      {label ? <small className="muted">{label}</small> : null}
    </>
  );
}
