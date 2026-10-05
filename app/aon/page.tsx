import type { Metadata } from "next";
import { fetchCampaignData } from "@/lib/data";
import Dashboard from "@/app/components/Dashboard";
import BackToCampaigns from "@/app/components/BackToCampaigns";

export const metadata: Metadata = {
  title: "Campo Santo · AON · Google Pesquisa",
  description:
    "Painel de mídia do Cemitério Campo Santo — Google Pesquisa. Acompanhamento de investimento, cliques e metas contratadas.",
};

// Renderizado a cada requisição (dados sempre frescos). Como "/aon" é uma rota
// server-side, o refresh (F5) sempre reconstrói a página — nunca dá 404.
export const dynamic = "force-dynamic";

export default async function Page() {
  const { google, google2, currentMonth, updatedAt, ok } =
    await fetchCampaignData();

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
