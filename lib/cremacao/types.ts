// Campanha Cremação (Meta Ads + YouTube). Totalmente separada da campanha AON:
// tipos, leitura e cálculos próprios, para que os dados nunca se misturem.

export type Platform = "meta" | "youtube";

// Linha da aba "CremacaoMeta" — uma linha por dia × anúncio × idade × gênero.
export interface MetaRow {
  date: string; // YYYY-MM-DD (horário de Brasília)
  campaign: string;
  adset: string;
  ad: string;
  thumbnail: string | null;
  permalink: string | null;
  age: string; // "18-24", "65+"…
  gender: string; // female | male | unknown
  investimento: number;
  impressoes: number;
  cliques: number;
  engajamento: number;
  reacoes: number;
  comentarios: number;
  salvamentos: number;
  videoPlays: number;
  thruplays: number;
}

// Linha da aba "CremacaoYT". A aba ainda não tem dados, então a leitura aceita
// vários nomes de coluna (ver `lib/cremacao/data.ts`).
export interface YtRow {
  date: string;
  campaign: string;
  adGroup: string;
  ad: string;
  videoId: string | null;
  thumbnail: string | null;
  investimento: number;
  impressoes: number;
  cliques: number;
  visualizacoes: number;
  // Taxas de reprodução por quartil (0–1); null quando a coluna não vem.
  q25: number | null;
  q50: number | null;
  q75: number | null;
  q100: number | null;
}

// Período contratado (inclusivo).
export const PERIOD = { start: "2026-10-04", end: "2026-11-13" } as const;

// Metas contratadas para o período inteiro.
export const GOALS = {
  meta: { investimento: 3000, impressoes: 333333 },
  youtube: { investimento: 4000, visualizacoes: 33333 },
} as const;

export const PLATFORM_INFO: Record<
  Platform,
  { label: string; strategy: string; color: string; soft: string }
> = {
  meta: {
    label: "Meta Ads",
    strategy: "Alcance",
    color: "var(--cr-meta)",
    soft: "var(--cr-meta-soft)",
  },
  youtube: {
    label: "YouTube",
    strategy: "Visualização",
    color: "var(--cr-yt)",
    soft: "var(--cr-yt-soft)",
  },
};
