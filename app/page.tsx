import { fetchCampaignData } from "@/lib/data";
import Dashboard from "@/app/components/Dashboard";

// Renderizado a cada requisição (dados sempre frescos). Como "/" é uma rota
// server-side, o refresh (F5) sempre reconstrói a página — nunca dá 404.
export const dynamic = "force-dynamic";

export default async function Page() {
  const { google, google2, currentMonth, updatedAt, ok } =
    await fetchCampaignData();

  return (
    <Dashboard
      google={google}
      google2={google2}
      currentMonth={currentMonth}
      updatedAt={updatedAt}
      ok={ok}
    />
  );
}
