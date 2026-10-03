import type { ReactNode } from "react";
import { PlatformShell } from "@/components/Shell";

export default function ModuleLayout({ children }: { children: ReactNode }) {
  return <PlatformShell>{children}</PlatformShell>;
}
