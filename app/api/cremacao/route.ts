import { fetchCremacaoData } from "@/lib/cremacao/data";

// Plano B do painel: se a página estática saiu sem dados (a planilha falhou
// na regeneração), o navegador busca por aqui, já normalizado.
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchCremacaoData();
  return Response.json(data, {
    status: data.ok ? 200 : 502,
    headers: { "Cache-Control": "no-store" },
  });
}
