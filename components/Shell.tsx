"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import type { PlatformCfg } from "@/data/types";
import { CFG } from "@/data";
import { SimProvider } from "./SimContext";
import { Ticker } from "./Ticker";
import { ThemeButton } from "./ThemeButton";
import { ToastHost } from "./Toast";

function Nav({ cfg, active, onNavigate }: { cfg: PlatformCfg; active: string; onNavigate?: () => void }) {
  const groups: { name: string; mods: typeof cfg.modules }[] = [];
  for (const m of cfg.modules) {
    const last = groups[groups.length - 1];
    if (!last || last.name !== m.group) groups.push({ name: m.group, mods: [m] });
    else last.mods.push(m);
  }
  return (
    <>
      <div className="brand">
        <Link href="/" className="brand-mark" aria-label="HMH ILA home">
          <span>ILA</span>
        </Link>
        <div>
          <b>{cfg.brandName}</b>
          <span className="brand-tag">{cfg.brandTag}</span>
        </div>
      </div>
      <nav className="nav" aria-label="Modules">
        {groups.map((g) => (
          <Fragment key={g.name}>
            <div className="nav-group">{g.name}</div>
            {g.mods.map((m) => (
              <Link
                key={m.id}
                href={`/${m.id}`}
                className="navlink"
                aria-current={m.id === active ? "page" : undefined}
                title={m.sub || ""}
                onClick={onNavigate}
              >
                <span className="dot" />
                {m.name}
              </Link>
            ))}
          </Fragment>
        ))}
      </nav>
      <div className="rail-foot">
        Prepared by ILA South Africa with HMH Group.
        <br />
        For discussion with the North West Provincial Government.
      </div>
    </>
  );
}

export function PlatformShell({ children }: { children: ReactNode }) {
  const cfg = CFG;
  const pathname = usePathname();
  const active = pathname.split("/")[1] || cfg.defaultModule;
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <SimProvider cfg={cfg}>
      <div className={`shell plat-${cfg.id}`} data-platform={cfg.id}>
        <aside className="rail side" aria-label="Sidebar">
          <Nav cfg={cfg} active={active} />
        </aside>

        <div className={`drawer-wrap${open ? " open" : ""}`}>
          <div className="scrim" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="rail drawer" id="module-drawer" aria-label="Modules navigation">
            <div className="drawer-top">
              <button type="button" className="drawer-close" onClick={() => setOpen(false)} aria-label="Close menu">
                ✕
              </button>
            </div>
            <Nav cfg={cfg} active={active} onNavigate={() => setOpen(false)} />
          </aside>
        </div>

        <div className="main">
          <div className="content">
            <div className="topbar">
              <div className="topbar-left">
                <button
                  type="button"
                  className="menu-btn"
                  aria-expanded={open}
                  aria-controls="module-drawer"
                  onClick={() => setOpen(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M1 3h14M1 8h14M1 13h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Menu
                </button>
                <div className="province">{cfg.provinceLabel}</div>
              </div>
              <div className="topbar-right">
                <ThemeButton />
              </div>
            </div>
            <Ticker />
            {children}
          </div>
        </div>
        <ToastHost />
      </div>
    </SimProvider>
  );
}
