import { MONTH_INDEX, RawRow } from "./types";

export interface Totals {
  investimento: number;
  cliques: number;
  impressoes: number;
  conversoes: number;
  ctr: number; // %
  cpc: number; // R$ por clique
  cpm: number; // R$ por mil impressões
  taxaConversao: number; // %
  custoConversao: number; // R$ por conversão
}

export function computeTotals(rows: RawRow[]): Totals {
  let investimento = 0;
  let cliques = 0;
  let impressoes = 0;
  let conversoes = 0;

  for (const r of rows) {
    investimento += num(r.Investimento);
    cliques += num(r.clicks);
    impressoes += num(r.impressions);
    conversoes += num(r.conversions);
  }

  return {
    investimento,
    cliques,
    impressoes,
    conversoes,
    ctr: impressoes > 0 ? (cliques / impressoes) * 100 : 0,
    cpc: cliques > 0 ? investimento / cliques : 0,
    cpm: impressoes > 0 ? (investimento / impressoes) * 1000 : 0,
    taxaConversao: cliques > 0 ? (conversoes / cliques) * 100 : 0,
    custoConversao: conversoes > 0 ? investimento / conversoes : 0,
  };
}

export interface DayPoint {
  ts: number; // timestamp para ordenação cronológica
  dateLabel: string; // "03/07"
  investimento: number;
  cliques: number;
  impressoes: number;
  conversoes: number;
}

// Série diária agregada por data-calendário (soma de todos os grupos/anúncios).
// Chaveada pela data completa para que "Todos os meses" gere uma linha do tempo
// contínua (Mar → Jul) em vez de sobrepor o mesmo dia do mês.
export function computeDaily(rows: RawRow[]): DayPoint[] {
  const map = new Map<string, DayPoint>();

  for (const r of rows) {
    const ts = Date.parse(r.date);
    if (!Number.isFinite(ts)) continue;
    const d = new Date(ts);
    const day = d.getUTCDate();
    const month = d.getUTCMonth() + 1;
    const key = r.date.slice(0, 10); // YYYY-MM-DD
    const dateLabel = `${pad(day)}/${pad(month)}`;

    const cur =
      map.get(key) ??
      ({
        ts,
        dateLabel,
        investimento: 0,
        cliques: 0,
        impressoes: 0,
        conversoes: 0,
      } as DayPoint);

    cur.investimento += num(r.Investimento);
    cur.cliques += num(r.clicks);
    cur.impressoes += num(r.impressions);
    cur.conversoes += num(r.conversions);
    map.set(key, cur);
  }

  return Array.from(map.values()).sort((a, b) => a.ts - b.ts);
}

export interface GroupSlice {
  name: string; // rótulo limpo
  raw: string; // ad_group_name original
  investimento: number;
  cliques: number;
  impressoes: number;
  conversoes: number;
  ctr: number;
  cpc: number;
}

// Limpa "[KEYWORDS] [Institucional]" -> "Institucional". A aba do mês corrente
// já traz o nome limpo ("Atendimento Whatsapp"), então nem sempre há colchetes.
export function cleanGroupName(raw: string): string {
  if (!raw) return "Sem grupo";
  const matches = raw.match(/\[([^\]]+)\]/g);
  if (matches && matches.length > 0) {
    const last = matches[matches.length - 1].replace(/[\[\]]/g, "").trim();
    return titleCasePt(last);
  }
  return raw;
}

// Chave de identidade do grupo: nome limpo, sem acentos/caixa/pontuação. Faz
// "[KEYWORDS] [ATENDIMENTO WHATSAPP]" e "Atendimento Whatsapp" caírem na mesma
// fatia quando o filtro cobre mais de um mês.
function groupKey(raw: string): string {
  return cleanGroupName(raw)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function titleCasePt(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function computeByGroup(rows: RawRow[]): GroupSlice[] {
  const map = new Map<string, GroupSlice>();

  for (const r of rows) {
    const raw = r.ad_group_name;
    const key = groupKey(raw);
    const cur =
      map.get(key) ??
      ({
        name: cleanGroupName(raw),
        raw,
        investimento: 0,
        cliques: 0,
        impressoes: 0,
        conversoes: 0,
        ctr: 0,
        cpc: 0,
      } as GroupSlice);

    cur.investimento += num(r.Investimento);
    cur.cliques += num(r.clicks);
    cur.impressoes += num(r.impressions);
    cur.conversoes += num(r.conversions);
    map.set(key, cur);
  }

  const arr = Array.from(map.values());
  for (const g of arr) {
    g.ctr = g.impressoes > 0 ? (g.cliques / g.impressoes) * 100 : 0;
    g.cpc = g.cliques > 0 ? g.investimento / g.cliques : 0;
  }
  return arr.sort((a, b) => b.cliques - a.cliques);
}

export interface AdRow {
  name: string;
  short: string;
  investimento: number;
  cliques: number;
  impressoes: number;
  conversoes: number;
  ctr: number;
  cpc: number;
}

export function computeByAd(rows: RawRow[]): AdRow[] {
  const map = new Map<string, AdRow>();

  for (const r of rows) {
    // A aba do mês corrente não traz a coluna de anúncio: essas linhas entram
    // nos totais e nos grupos, mas não têm detalhamento por anúncio.
    const name = r.ad_name;
    if (!name) continue;
    const cur =
      map.get(name) ??
      ({
        name,
        short: name.split("|")[0].trim(),
        investimento: 0,
        cliques: 0,
        impressoes: 0,
        conversoes: 0,
        ctr: 0,
        cpc: 0,
      } as AdRow);

    cur.investimento += num(r.Investimento);
    cur.cliques += num(r.clicks);
    cur.impressoes += num(r.impressions);
    cur.conversoes += num(r.conversions);
    map.set(name, cur);
  }

  const arr = Array.from(map.values());
  for (const a of arr) {
    a.ctr = a.impressoes > 0 ? (a.cliques / a.impressoes) * 100 : 0;
    a.cpc = a.cliques > 0 ? a.investimento / a.cliques : 0;
  }
  return arr.sort((a, b) => b.cliques - a.cliques);
}

export interface MonthSummary {
  mes: string;
  investimento: number;
  cliques: number;
  impressoes: number;
  conversoes: number;
  isCurrent: boolean;
}

// Resumo por mês em ordem cronológica (para o comparativo).
export function computeByMonth(
  rows: RawRow[],
  currentMonth: string | null,
): MonthSummary[] {
  const map = new Map<string, MonthSummary>();

  for (const r of rows) {
    const mes = r.Mes;
    const cur =
      map.get(mes) ??
      ({
        mes,
        investimento: 0,
        cliques: 0,
        impressoes: 0,
        conversoes: 0,
        isCurrent: mes === currentMonth,
      } as MonthSummary);

    cur.investimento += num(r.Investimento);
    cur.cliques += num(r.clicks);
    cur.impressoes += num(r.impressions);
    cur.conversoes += num(r.conversions);
    map.set(mes, cur);
  }

  return Array.from(map.values()).sort(
    (a, b) => (MONTH_INDEX[a.mes] ?? 99) - (MONTH_INDEX[b.mes] ?? 99),
  );
}

// Ritmo esperado no mês corrente: fração do mês já decorrida com base no
// último dia com dados. Usado para o marcador de "onde deveríamos estar".
export function monthPace(rows: RawRow[]): {
  fraction: number;
  daysElapsed: number;
  daysInMonth: number;
} {
  if (rows.length === 0) return { fraction: 1, daysElapsed: 0, daysInMonth: 30 };

  let maxDay = 0;
  let year = 2026;
  let month = 1;
  for (const r of rows) {
    const t = Date.parse(r.date);
    if (!Number.isFinite(t)) continue;
    const d = new Date(t);
    const day = d.getUTCDate();
    if (day > maxDay) {
      maxDay = day;
      year = d.getUTCFullYear();
      month = d.getUTCMonth() + 1;
    }
  }
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    fraction: Math.min(1, maxDay / daysInMonth),
    daysElapsed: maxDay,
    daysInMonth,
  };
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// ---- Formatação (pt-BR) ----
export function fmtBRL(v: number, digits = 0): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtNum(v: number): string {
  return Math.round(v).toLocaleString("pt-BR");
}

export function fmtPct(v: number, digits = 1): string {
  return `${v.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

export function fmtCompact(v: number): string {
  if (v >= 1000) {
    return (v / 1000).toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }) + "k";
  }
  return fmtNum(v);
}
