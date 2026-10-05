import type { Metadata } from "next";
import { fetchCampaignData, keepPreviousOnFailure } from "@/lib/data";
import Dashboard from "@/app/components/Dashboard";
import BackToCampaigns from "@/app/components/BackToCampaigns";

export const metadata: Metadata = {
  title: "Campo Santo · AON · Google Pesquisa",
  description:
    "Painel de mídia do Cemitério Campo Santo — Google Pesquisa. Acompanhamento de investimento, cliques e metas contratadas.",
};

// ISR: a página fica pronta no servidor e é servida na hora; a cada 5 min a
// próxima visita dispara a regeneração em segundo plano. Se ela falhar, a
// versão anterior continua no ar.
export const revalidate = 300;

export default async function Page() {
  const { google, google2, currentMonth, updatedAt, ok } =
    await fetchCampaignData();
  keepPreviousOnFailure(ok);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 -mb-3">
        <BackToCampaigns />
      </div>
      <Dashboard
        google={google}
        google2={google2}
        currentMonth={currentMonth}
        updatedAt={updatedAt}
        ok={ok}
      />
    </>
  );
}
