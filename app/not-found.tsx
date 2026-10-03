import Link from "next/link";
import { ThemeButton } from "@/components/ThemeButton";

export default function NotFound() {
  return (
    <div className="plat-home home">
      <div className="content" style={{ display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
        <div className="home-bar">
          <div className="brand" style={{ padding: 0 }}>
            <Link href="/" className="brand-mark" aria-label="HMH ILA home">
              <span>ILA</span>
            </Link>
            <div>
              <b>HMH ILA Minerals</b>
              <span className="brand-tag" style={{ color: "var(--muted)" }}>
                Cooperative export platform
              </span>
            </div>
          </div>
          <div className="topbar-right">
            <ThemeButton />
          </div>
        </div>
        <div className="home-hero">
          <h1>Page not found.</h1>
          <p>That module or page does not exist.</p>
        </div>
        <div>
          <Link className="btn alt" href="/">
            Back to the dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
