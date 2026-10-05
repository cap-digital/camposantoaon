import type { Metadata } from "next";
import { fetchCremacaoData } from "@/lib/cremacao/data";
import { todayBR } from "@/lib/cremacao/metrics";
import CremacaoDashboard from "./components/CremacaoDashboard";
import { TABS, TabKey } from "./tabs";

export const metadata: Metadata = {
  title: "Campo Santo · Campanha Cremação",
  description:
    "Painel da Campanha Cremação do Cemitério Campo Santo — Meta Ads (alcance) e YouTube (visualização), de 04/10 a 13/11/2026.",
};

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: { aba?: string };
}) {
  const { meta, youtube, updatedAt, ok } = await fetchCremacaoData();
  const initialTab = (TABS.find((t) => t.key === searchParams.aba)?.key ??
    "geral") as TabKey;

  return (
    <CremacaoDashboard
      meta={meta}
      youtube={youtube}
      updatedAt={updatedAt}
      ok={ok}
      today={todayBR()}
      initialTab={initialTab}
    />
  );
}
