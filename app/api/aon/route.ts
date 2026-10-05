import { fetchCampaignData } from "@/lib/data";

// Plano B do painel AON (ver app/api/cremacao/route.ts).
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchCampaignData();
  return Response.json(data, {
    status: data.ok ? 200 : 502,
    headers: { "Cache-Control": "no-store" },
  });
}
