import { MetaRow, PERIOD, Platform, YtRow } from "./types";

// ---- Datas (strings YYYY-MM-DD, sem fuso) ----
const DAY = 86400000;

function toUtc(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

export function addDays(iso: string, n: number): string {
  return new Date(toUtc(iso) + n * DAY).toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toUtc(b) - toUtc(a)) / DAY);
}

export function dateLabel(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

// Hoje no horário de Brasília.
export function todayBR(): string {
  return new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
}

export interface PeriodInfo {
  totalDays: number;
  day: number; // dia corrente da campanha (0 antes do início)
  status: "agendada" | "andamento" | "encerrada";
}

export function periodInfo(today: string): PeriodInfo {
  const totalDays = daysBetween(PERIOD.start, PERIOD.end) + 1;
  const d = daysBetween(PERIOD.start, today) + 1;
  if (d < 1) return { totalDays, day: 0, status: "agendada" };
  if (d > totalDays) return { totalDays, day: totalDays, status: "encerrada" };
  return { totalDays, day: d, status: "andamento" };
}

// ---- Totais ----
export interface MetaTotals {
  investimento: number;
  impressoes: number;
  cliques: number;
  engajamento: number;
  reacoes: number;
  comentarios: number;
  salvamentos: number;
  videoPlays: number;
  thruplays: number;
  ctr: number; // %
  cpm: number;
  cpc: number;
}

export function sumMeta(rows: MetaRow[]): MetaTotals {
  const t = {
    investimento: 0,
    impressoes: 0,
    cliques: 0,
    engajamento: 0,
    reacoes: 0,
    comentarios: 0,
    salvamentos: 0,
    videoPlays: 0,
    thruplays: 0,
  };
  for (const r of rows) {
    t.investimento += r.investimento;
    t.impressoes += r.impressoes;
    t.cliques += r.cliques;
    t.engajamento += r.engajamento;
    t.reacoes += r.reacoes;
    t.comentarios += r.comentarios;
    t.salvamentos += r.salvamentos;
    t.videoPlays += r.videoPlays;
    t.thruplays += r.thruplays;
  }
  return {
    ...t,
    ctr: t.impressoes > 0 ? (t.cliques / t.impressoes) * 100 : 0,
    cpm: t.impressoes > 0 ? (t.investimento / t.impressoes) * 1000 : 0,
    cpc: t.cliques > 0 ? t.investimento / t.cliques : 0,
  };
}

export interface YtTotals {
  investimento: number;
  impressoes: number;
  cliques: number;
  visualizacoes: number;
  ctr: number; // %
  cpm: number;
  cpv: number; // R$ por visualização
  taxaVisualizacao: number; // % visualizações / impressões
  // Quartis ponderados por impressões (0–1); null se a planilha não traz.
  quartis: [number, number, number, number] | null;
}

export function sumYt(rows: YtRow[]): YtTotals {
  let investimento = 0;
  let impressoes = 0;
  let cliques = 0;
  let visualizacoes = 0;
  const q = [0, 0, 0, 0];
  let qBase = 0;
  for (const r of rows) {
    investimento += r.investimento;
    impressoes += r.impressoes;
    cliques += r.cliques;
    visualizacoes += r.visualizacoes;
    if (r.q25 != null && r.impressoes > 0) {
      q[0] += r.q25 * r.impressoes;
      q[1] += (r.q50 ?? 0) * r.impressoes;
      q[2] += (r.q75 ?? 0) * r.impressoes;
      q[3] += (r.q100 ?? 0) * r.impressoes;
      qBase += r.impressoes;
    }
  }
  return {
    investimento,
    impressoes,
    cliques,
    visualizacoes,
    ctr: impressoes > 0 ? (cliques / impressoes) * 100 : 0,
    cpm: impressoes > 0 ? (investimento / impressoes) * 1000 : 0,
    cpv: visualizacoes > 0 ? investimento / visualizacoes : 0,
    taxaVisualizacao: impressoes > 0 ? (visualizacoes / impressoes) * 100 : 0,
    quartis:
      qBase > 0
        ? [q[0] / qBase, q[1] / qBase, q[2] / qBase, q[3] / qBase]
        : null,
  };
}

// ---- Série diária por plataforma ----
export interface DayMetrics {
  investimento: number;
  impressoes: number;
  cliques: number;
  visualizacoes: number;
}

export interface CrDay {
  date: string;
  label: string;
  meta: DayMetrics;
  youtube: DayMetrics;
}

function emptyDay(): DayMetrics {
  return { investimento: 0, impressoes: 0, cliques: 0, visualizacoes: 0 };
}

// Um ponto por dia de `start` até `end` (inclusive), com zero nos dias sem
// entrega — a linha do tempo fica contínua mesmo antes do YouTube começar.
export function dailySeries(
  meta: MetaRow[],
  yt: YtRow[],
  start: string,
  end: string,
): CrDay[] {
  const n = Math.max(0, daysBetween(start, end) + 1);
  const days: CrDay[] = [];
  const idx = new Map<string, CrDay>();
  for (let i = 0; i < n; i++) {
    const date = addDays(start, i);
    const d = { date, label: dateLabel(date), meta: emptyDay(), youtube: emptyDay() };
    days.push(d);
    idx.set(date, d);
  }
  for (const r of meta) {
    const d = idx.get(r.date);
    if (!d) continue;
    d.meta.investimento += r.investimento;
    d.meta.impressoes += r.impressoes;
    d.meta.cliques += r.cliques;
  }
  for (const r of yt) {
    const d = idx.get(r.date);
    if (!d) continue;
    d.youtube.investimento += r.investimento;
    d.youtube.impressoes += r.impressoes;
    d.youtube.cliques += r.cliques;
    d.youtube.visualizacoes += r.visualizacoes;
  }
  return days;
}

// Último dia com entrega em qualquer plataforma.
export function lastDataDate(meta: MetaRow[], yt: YtRow[]): string | null {
  let max: string | null = null;
  for (const r of meta) if (!max || r.date > max) max = r.date;
  for (const r of yt) if (!max || r.date > max) max = r.date;
  return max;
}

// ---- Idade × gênero (Meta) ----
export const GENDER_ORDER = ["female", "male", "unknown"] as const;
export const GENDER_LABEL: Record<string, string> = {
  female: "Feminino",
  male: "Masculino",
  unknown: "Não informado",
};

export interface AgeGenderCell {
  age: string;
  gender: string;
  investimento: number;
  impressoes: number;
  cliques: number;
}

export function ageGender(rows: MetaRow[]): {
  ages: string[];
  genders: string[];
  cells: Map<string, AgeGenderCell>;
} {
  const cells = new Map<string, AgeGenderCell>();
  const ages = new Set<string>();
  const genders = new Set<string>();
  for (const r of rows) {
    ages.add(r.age);
    genders.add(r.gender);
    const key = `${r.age}|${r.gender}`;
    const c =
      cells.get(key) ??
      { age: r.age, gender: r.gender, investimento: 0, impressoes: 0, cliques: 0 };
    c.investimento += r.investimento;
    c.impressoes += r.impressoes;
    c.cliques += r.cliques;
    cells.set(key, c);
  }
  const gOrder = (g: string) => {
    const i = (GENDER_ORDER as readonly string[]).indexOf(g);
    return i < 0 ? 99 : i;
  };
  return {
    ages: Array.from(ages).sort((a, b) => parseInt(a) - parseInt(b)),
    genders: Array.from(genders).sort((a, b) => gOrder(a) - gOrder(b)),
    cells,
  };
}

// ---- Criativos ----
export interface Creative {
  key: string;
  platform: Platform;
  name: string;
  thumbnail: string | null;
  permalink: string | null;
  videoId: string | null;
  investimento: number;
  impressoes: number;
  cliques: number;
  visualizacoes: number;
  engajamento: number;
  ctr: number;
  cpm: number;
  firstDate: string;
  lastDate: string;
}

export function creatives(meta: MetaRow[], yt: YtRow[]): Creative[] {
  const map = new Map<string, Creative>();
  const touch = (
    key: string,
    base: Omit<Creative, "investimento" | "impressoes" | "cliques" | "visualizacoes" | "engajamento" | "ctr" | "cpm" | "firstDate" | "lastDate">,
    date: string,
  ) => {
    const c =
      map.get(key) ??
      ({
        ...base,
        investimento: 0,
        impressoes: 0,
        cliques: 0,
        visualizacoes: 0,
        engajamento: 0,
        ctr: 0,
        cpm: 0,
        firstDate: date,
        lastDate: date,
      } as Creative);
    if (date < c.firstDate) c.firstDate = date;
    if (date > c.lastDate) c.lastDate = date;
    // Mantém a miniatura mais recente (as URLs do Facebook expiram).
    if (base.thumbnail && date >= c.lastDate) c.thumbnail = base.thumbnail;
    map.set(key, c);
    return c;
  };

  for (const r of meta) {
    const c = touch(
      `meta|${r.ad}`,
      {
        key: `meta|${r.ad}`,
        platform: "meta",
        name: r.ad,
        thumbnail: r.thumbnail,
        permalink: r.permalink,
        videoId: null,
      },
      r.date,
    );
    c.investimento += r.investimento;
    c.impressoes += r.impressoes;
    c.cliques += r.cliques;
    c.engajamento += r.engajamento;
    c.visualizacoes += r.videoPlays;
  }
  for (const r of yt) {
    const id = r.videoId ?? r.ad;
    const c = touch(
      `youtube|${id}`,
      {
        key: `youtube|${id}`,
        platform: "youtube",
        name: r.ad,
        thumbnail: r.thumbnail,
        permalink: r.videoId ? `https://www.youtube.com/watch?v=${r.videoId}` : null,
        videoId: r.videoId,
      },
      r.date,
    );
    c.investimento += r.investimento;
    c.impressoes += r.impressoes;
    c.cliques += r.cliques;
    c.visualizacoes += r.visualizacoes;
  }

  const arr = Array.from(map.values());
  for (const c of arr) {
    c.ctr = c.impressoes > 0 ? (c.cliques / c.impressoes) * 100 : 0;
    c.cpm = c.impressoes > 0 ? (c.investimento / c.impressoes) * 1000 : 0;
  }
  return arr.sort((a, b) => b.investimento - a.investimento);
}

// Nome curto do anúncio: tira prefixos entre colchetes ("[DARKPOST] …").
export function shortAdName(name: string): string {
  const s = name.replace(/\[[^\]]*\]\s*/g, "").trim();
  return s || name;
}

// Escala "redonda" para eixos.
export function niceMax(v: number): number {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * pow;
}
