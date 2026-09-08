// Forma canônica de uma linha, já normalizada por `lib/data.ts`.
// As abas da planilha não usam os mesmos cabeçalhos: a aba "google" (mês
// corrente) vem com os títulos originais do Google Ads e sem coluna de
// anúncio, enquanto "google2" (histórico) usa nomes normalizados.
export interface RawRow {
  date: string;
  campaign: string;
  ad_group_name: string;
  ad_name: string | null; // ausente na aba do mês corrente
  clicks: number;
  impressions: number;
  conversions: number;
  Estratégia: string;
  Mes: string;
  Investimento: number;
}

// Registro cru, como chega do endpoint — chaves variam por aba.
export type SheetRecord = Record<string, unknown>;

export interface ApiResponse {
  success: boolean;
  google: SheetRecord[]; // mês atual
  google2: SheetRecord[]; // meses anteriores
  timestamp?: string;
}

// Ordem cronológica dos meses em português (para ordenar filtros e comparativos).
export const MONTH_ORDER = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export const MONTH_INDEX: Record<string, number> = {
  Janeiro: 0,
  Fevereiro: 1,
  Março: 2,
  Abril: 3,
  Maio: 4,
  Junho: 5,
  Julho: 6,
  Agosto: 7,
  Setembro: 8,
  Outubro: 9,
  Novembro: 10,
  Dezembro: 11,
};

// Metas contratadas, iguais para todos os meses.
export const GOAL_INVESTIMENTO = 2000;
export const GOAL_CLIQUES = 909;
