import type { Metadata } from "next";
import { fetchCremacaoData } from "@/lib/cremacao/data";
import { todayBR } from "@/lib/cremacao/metrics";
import CremacaoDashboard from "./components/CremacaoDashboard";

export const metadata: Metadata = {
  title: "Campo Santo · Campanha Cremação",
  description:
    "Painel da Campanha Cremação do Cemitério Campo Santo — Meta Ads (alcance) e YouTube (visualização), de 04/10 a 13/11/2026.",
};

// ISR (ver app/aon/page.tsx). A aba (?aba=…) é lida no cliente para a página
// continuar estática. Se a leitura falhar aqui, o painel busca os dados no
// navegador por /api/cremacao.
export const revalidate = 300;

export default async function Page() {
  const { meta, youtube, updatedAt, ok } = await fetchCremacaoData();

  return (
    <CremacaoDashboard
      meta={meta}
      youtube={youtube}
      updatedAt={updatedAt}
      ok={ok}
      today={todayBR()}
    />
  );
}
