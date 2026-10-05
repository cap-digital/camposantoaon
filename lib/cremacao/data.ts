import { fetchSheets, pick, str, toNum } from "../data";
import { SheetRecord } from "../types";
import { MetaRow, YtRow } from "./types";

// Cabeçalhos aceitos por campo. O primeiro de cada lista é o nome atual da
// planilha (Meta: API do Facebook; YouTube: conector do Google Ads, ex.
// "video_trueview_views", "URL Video"); os demais cobrem variações comuns.
const META = {
  date: ["date", "date_start", "Date", "Day", "Dia"],
  campaign: ["campaign", "campaign_name", "Campaign Name"],
  adset: ["adset_name", "Ad Set Name", "adset"],
  ad: ["ad_name", "Ad Name"],
  thumbnail: ["thumbnail_url", "image_url"],
  permalink: ["instagram_permalink_url", "permalink", "post_url"],
  age: ["age", "Age", "Idade"],
  gender: ["gender", "Gender", "Gênero"],
  investimento: ["Investimento", "spend"],
  impressions: ["impressions", "Impressions", "Impressões"],
  clicks: ["clicks", "Clicks", "Cliques"],
  engagement: ["actions_post_engagement"],
  reactions: ["actions_post_reaction"],
  comments: ["actions_comment"],
  saves: ["actions_onsite_conversion_post_save"],
  videoPlays: ["video_play_actions_video_view", "actions_video_view"],
  thruplays: ["video_thruplay_watched_actions_video_view"],
} as const;

const YT = {
  date: ["date", "Date", "Date (Segment)", "segments_date", "Day", "Dia"],
  campaign: ["campaign", "Campaign Name", "Campaign", "campaign_name"],
  adGroup: ["ad_group_name", "Ad Group Name", "Ad Group", "adgroup_name"],
  // Título do vídeo primeiro: o nome do anúncio no YouTube costuma ser genérico.
  ad: ["video_title", "Video Title", "Video title", "ad_name", "Ad Name", "video_name", "Ad"],
  video: [
    "URL Video",
    "video_id",
    "Video ID",
    "Video Id",
    "youtube_video_id",
    "ad_video_id",
    "video_url",
    "Video URL",
    "youtube_url",
  ],
  thumbnail: ["thumbnail_url", "Thumbnail URL"],
  investimento: ["Investimento", "Cost (Spend, Amount Spent)", "Cost", "cost", "spend"],
  impressions: ["impressions", "Impressions", "Impressões"],
  clicks: ["clicks", "Clicks", "Cliques"],
  views: [
    "video_trueview_views",
    "video_views",
    "Video Views",
    "Video views",
    "views",
    "Views",
    "Visualizações",
    "Visualizacoes",
    "TrueView Views",
  ],
  q25: ["video_quartile25_rate", "video_quartile_p25_rate", "Video Played to 25%", "Video played to 25%", "video_p25_rate"],
  q50: ["video_quartile50_rate", "video_quartile_p50_rate", "Video Played to 50%", "Video played to 50%", "video_p50_rate"],
  q75: ["video_quartile75_rate", "video_quartile_p75_rate", "Video Played to 75%", "Video played to 75%", "video_p75_rate"],
  q100: ["video_quartile100_rate", "video_quartile_p100_rate", "Video Played to 100%", "Video played to 100%", "video_p100_rate"],
} as const;

// Converte a data para YYYY-MM-DD no horário de Brasília. As abas trazem
// meia-noite de Brasília em UTC ("2026-10-05T03:00:00.000Z").
export function toBrDate(v: string): string | null {
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const br = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const t = Date.parse(v);
  if (!Number.isFinite(t)) return null;
  return new Date(t - 3 * 3600 * 1000).toISOString().slice(0, 10);
}

function textOrNull(v: unknown): string | null {
  const s = str(v);
  return s ? s : null;
}

// Taxa de quartil: aceita 0–1 ou 0–100 ("25%").
function rate(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = toNum(v);
  return n > 1 ? n / 100 : n;
}

// Extrai o ID de 11 caracteres de um ID ou URL do YouTube.
export function youtubeId(v: unknown): string | null {
  const s = str(v);
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function normalizeMeta(row: SheetRecord): MetaRow | null {
  const date = toBrDate(str(pick(row, META.date)));
  if (!date) return null;
  return {
    date,
    campaign: str(pick(row, META.campaign)),
    adset: str(pick(row, META.adset)),
    ad: str(pick(row, META.ad)) || "Anúncio sem nome",
    thumbnail: textOrNull(pick(row, META.thumbnail)),
    permalink: textOrNull(pick(row, META.permalink)),
    age: str(pick(row, META.age)) || "Desconhecida",
    gender: (str(pick(row, META.gender)) || "unknown").toLowerCase(),
    investimento: toNum(pick(row, META.investimento)),
    impressoes: toNum(pick(row, META.impressions)),
    cliques: toNum(pick(row, META.clicks)),
    engajamento: toNum(pick(row, META.engagement)),
    reacoes: toNum(pick(row, META.reactions)),
    comentarios: toNum(pick(row, META.comments)),
    salvamentos: toNum(pick(row, META.saves)),
    videoPlays: toNum(pick(row, META.videoPlays)),
    thruplays: toNum(pick(row, META.thruplays)),
  };
}

function normalizeYt(row: SheetRecord): YtRow | null {
  const date = toBrDate(str(pick(row, YT.date)));
  if (!date) return null;
  const videoId = youtubeId(pick(row, YT.video));
  return {
    date,
    campaign: str(pick(row, YT.campaign)),
    adGroup: str(pick(row, YT.adGroup)),
    ad: str(pick(row, YT.ad)) || (videoId ? `Vídeo ${videoId}` : "Vídeo sem nome"),
    videoId,
    thumbnail:
      textOrNull(pick(row, YT.thumbnail)) ??
      (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null),
    investimento: toNum(pick(row, YT.investimento)),
    impressoes: toNum(pick(row, YT.impressions)),
    cliques: toNum(pick(row, YT.clicks)),
    visualizacoes: toNum(pick(row, YT.views)),
    q25: rate(pick(row, YT.q25)),
    q50: rate(pick(row, YT.q50)),
    q75: rate(pick(row, YT.q75)),
    q100: rate(pick(row, YT.q100)),
  };
}

function normalizeAll<T>(value: unknown, fn: (r: SheetRecord) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  const out: T[] = [];
  for (const r of value) {
    if (r && typeof r === "object") {
      const n = fn(r as SheetRecord);
      if (n) out.push(n);
    }
  }
  return out;
}

// Mesmo endpoint da AON (chamada compartilhada), lendo só as abas da Cremação.
export async function fetchCremacaoData(): Promise<{
  meta: MetaRow[];
  youtube: YtRow[];
  updatedAt: string | null;
  ok: boolean;
}> {
  try {
    const data = await fetchSheets();

    return {
      meta: normalizeAll(data.cremacaoMeta ?? data.CremacaoMeta, normalizeMeta),
      youtube: normalizeAll(data.cremacaoYT ?? data.CremacaoYT, normalizeYt),
      updatedAt: typeof data.timestamp === "string" ? data.timestamp : null,
      ok: true,
    };
  } catch {
    return { meta: [], youtube: [], updatedAt: null, ok: false };
  }
}
