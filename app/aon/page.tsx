import type { Metadata } from "next";
import { fetchCampaignData } from "@/lib/data";
import AonPanel from "./AonPanel";
import BackToCampaigns from "@/app/components/BackToCampaigns";

export const metadata: Metadata = {
  title: "Campo Santo · AON · Google Pesquisa",
  description:
    "Painel de mídia do Cemitério Campo Santo — Google Pesquisa. Acompanhamento de investimento, cliques e metas contratadas.",
};

// ISR: a página fica pronta no servidor e é servida na hora; a cada 5 min a
// próxima visita dispara a regeneração em segundo plano. Se a leitura falhar,
// a página sai mesmo assim e o painel busca os dados no navegador (/api/aon).
export const revalidate = 300;

export default async function Page() {
  const { google, google2, currentMonth, updatedAt, ok } =
    await fetchCampaignData();

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 -mb-3">
        <BackToCampaigns />
      </div>
      <AonPanel
        google={google}
        google2={google2}
        currentMonth={currentMonth}
        updatedAt={updatedAt}
        ok={ok}
      />
    </>
  );
}
