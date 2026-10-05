import { cache } from "react";
import { ApiResponse, RawRow, SheetRecord } from "./types";

const ENDPOINT =
  "https://cqrpbiepyeypbkizwacu.supabase.co/functions/v1/CampoSantoAON";
const KEY = "sb_publishable_YN9YKLw6sludrgf9T2i_1g_Dcm8dIiK";

// Cabeçalhos aceitos para cada campo canônico. A aba do mês corrente passou a
// vir com os títulos originais do Google Ads ("Ad Group Name", "Clicks", …) e
// sem coluna de anúncio; o histórico mantém os nomes normalizados. Ler pelos
// dois conjuntos evita quebrar o painel a cada troca de cabeçalho.
const ALIASES = {
  date: ["date", "Date (Segment)", "Date", "Day", "Dia"],
  campaign: ["campaign", "Campaign Name", "Campaign", "Campanha"],
  ad_group_name: ["ad_group_name", "Ad Group Name", "Ad Group", "Grupo de Anúncios"],
  ad_name: ["ad_name", "Ad Name", "Ad", "Anúncio"],
  clicks: ["clicks", "Clicks", "Cliques"],
  impressions: ["impressions", "Impressions", "Impressões"],
  conversions: ["conversions", "Conversions", "Conversões"],
  estrategia: ["Estratégia", "Estrategia"],
  mes: ["Mes", "Mês"],
  investimento: ["Investimento", "Cost (Spend, Amount Spent)", "Cost", "spend"],
} as const;

export function pick(row: SheetRecord, keys: readonly string[]): unknown {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

export function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : v == null ? "" : String(v);
}

export function toNum(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v !== "string") return 0;
  // Aceita "R$ 1.234,56" e "1234.56".
  const cleaned = v
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

// Converte um registro cru na forma canônica. Retorna null para linhas sem
// data ou sem mês (cabeçalhos repetidos, totais, linhas em branco da planilha).
export function normalizeRow(row: SheetRecord): RawRow | null {
  const date = str(pick(row, ALIASES.date));
  const mes = str(pick(row, ALIASES.mes));
  if (!date || !mes || Number.isNaN(Date.parse(date))) return null;

  const adName = str(pick(row, ALIASES.ad_name));

  return {
    date,
    campaign: str(pick(row, ALIASES.campaign)),
    ad_group_name: str(pick(row, ALIASES.ad_group_name)) || "Sem grupo",
    ad_name: adName || null,
    clicks: toNum(pick(row, ALIASES.clicks)),
    impressions: toNum(pick(row, ALIASES.impressions)),
    conversions: toNum(pick(row, ALIASES.conversions)),
    Estratégia: str(pick(row, ALIASES.estrategia)),
    Mes: mes,
    Investimento: toNum(pick(row, ALIASES.investimento)),
  };
}

function normalizeAll(value: unknown): RawRow[] {
  if (!Array.isArray(value)) return [];
  const out: RawRow[] = [];
  for (const r of value) {
    if (r && typeof r === "object") {
      const norm = normalizeRow(r as SheetRecord);
      if (norm) out.push(norm);
    }
  }
  return out;
}

// Busca os dados no servidor (SSR). Feito no servidor para evitar CORS e manter
// o painel funcional em refresh (F5) — as rotas são renderizadas a cada requisição.
// O endpoint responde em ~5s, mas às vezes trava ~35s e devolve 500 (o Apps
// Script responde HTML em vez de JSON). Cortamos a espera e tentamos de novo.
const ATTEMPTS = 2;
const TIMEOUT_MS = 25000;

async function requestSheets(): Promise<Record<string, unknown>> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      apikey: KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "Functions" }),
    // Cache curto de dados (só respostas OK). `no-store` tornaria as páginas
    // dinâmicas e desligaria o ISR; com 60s + regeneração de 5 min, os dados
    // ficam no máximo ~6 min atrasados.
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

async function requestWithRetry(): Promise<Record<string, unknown>> {
  let lastError: unknown;
  for (let i = 0; i < ATTEMPTS; i++) {
    try {
      return await requestSheets();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// Uma única leitura por requisição: a página inicial lê AON e Cremação ao
// mesmo tempo e compartilha a mesma resposta. O cache entre visitas é feito
// pelas páginas (ISR, `revalidate` em cada page.tsx).
export const fetchSheets = cache(requestWithRetry);

// Em produção, se a regeneração em segundo plano falhar, lançar o erro faz o
// Next manter no ar a versão anterior da página em vez de publicar a tela de
// erro. No build (primeira geração) não há versão anterior: aí a página sai
// com o aviso de erro e é refeita na próxima regeneração.
export function keepPreviousOnFailure(ok: boolean): void {
  if (
    !ok &&
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    throw new Error("Falha ao atualizar os dados da planilha; mantendo a versão anterior.");
  }
}


export async function fetchCampaignData(): Promise<{
  google: RawRow[];
  google2: RawRow[];
  currentMonth: string | null;
  updatedAt: string | null;
  ok: boolean;
}> {
  try {
    const data = (await fetchSheets()) as unknown as ApiResponse;

    const google = normalizeAll(data.google);
    const google2 = normalizeAll(data.google2);

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
