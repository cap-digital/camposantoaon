import { ApiResponse, RawRow } from "./types";

const ENDPOINT =
  "https://cqrpbiepyeypbkizwacu.supabase.co/functions/v1/CampoSantoAON";
const KEY = "sb_publishable_YN9YKLw6sludrgf9T2i_1g_Dcm8dIiK";

// Busca os dados no servidor (SSR). Feito no servidor para evitar CORS e manter
// o painel funcional em refresh (F5) — a rota "/" é renderizada a cada requisição.
export async function fetchCampaignData(): Promise<{
  google: RawRow[];
  google2: RawRow[];
  currentMonth: string | null;
  updatedAt: string | null;
  ok: boolean;
}> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        apikey: KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Functions" }),
      // Sempre buscar dados frescos.
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as ApiResponse;

    const google = Array.isArray(data.google) ? data.google : [];
    const google2 = Array.isArray(data.google2) ? data.google2 : [];

    // O mês atual é o único presente na aba "google".
    const currentMonth = google.length > 0 ? google[0].Mes : null;

    return {
      google,
      google2,
      currentMonth,
      updatedAt: data.timestamp ?? null,
      ok: true,
    };
  } catch {
    return {
      google: [],
      google2: [],
      currentMonth: null,
      updatedAt: null,
      ok: false,
    };
  }
}
