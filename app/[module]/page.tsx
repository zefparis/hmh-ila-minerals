import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CFG } from "@/data";
import { MODULES } from "@/components/modules";

export const dynamicParams = false;

export function generateStaticParams() {
  return CFG.modules.map((m) => ({ module: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}): Promise<Metadata> {
  const { module } = await params;
  const mod = CFG.modules.find((m) => m.id === module);
  if (!mod) return {};
  return { title: `${mod.name} · ${CFG.siteTitle}` };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const View = MODULES[module];
  if (!View) notFound();
  return <View />;
}
