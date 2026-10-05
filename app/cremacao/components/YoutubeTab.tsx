"use client";

import { useMemo } from "react";
import { GOALS, PERIOD, YtRow } from "@/lib/cremacao/types";
import {
  creatives,
  dailySeries,
  daysBetween,
  lastDataDate,
  sumYt,
} from "@/lib/cremacao/metrics";
import { fmtBRL, fmtNum, fmtPct } from "@/lib/metrics";
import ViewsMultiples from "./ViewsMultiples";
import RetentionCurve from "./RetentionCurve";
import VideoRanking from "./VideoRanking";
import { Kpi } from "./ui";

function PlayMark() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
      <rect x="4" y="12" width="48" height="32" rx="10" fill="var(--cr-yt-soft)" stroke="var(--cr-yt)" strokeWidth="1.6" />
      <path d="M24 21.5 L34 28 L24 34.5 Z" fill="var(--cr-yt)" />
    </svg>
  );
}

export default function YoutubeTab({ youtube, today }: { youtube: YtRow[]; today: string }) {
  const t = useMemo(() => sumYt(youtube), [youtube]);
  const videos = useMemo(() => creatives([], youtube), [youtube]);
  const days = useMemo(() => {
    const last = lastDataDate([], youtube) ?? today;
    const end = last > today ? last : today;
    const span = Math.min(daysBetween(PERIOD.start, PERIOD.end), Math.max(0, daysBetween(PERIOD.start, end)));
    return dailySeries([], youtube, PERIOD.start, PERIOD.end).slice(0, span + 1);
  }, [youtube, today]);

  if (youtube.length === 0) {
    return (
      <div className="cr-card cs-rise p-8 sm:p-10 flex flex-col items-center text-center">
        <PlayMark />
        <h2 className="text-[18px] font-semibold mt-4" style={{ color: "var(--ink)" }}>
          Aguardando os primeiros dados do YouTube
        </h2>
        <p className="text-[13.5px] mt-2 max-w-md" style={{ color: "var(--ink-2)" }}>
          A campanha de visualização ainda não registrou entrega. Assim que a
          planilha receber os dados, esta aba passa a mostrar visualizações por
          dia, custo por visualização, retenção e o ranking dos vídeos.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm">
          <div className="rounded-2xl p-4" style={{ background: "var(--cr-yt-soft)" }}>
            <div className="text-[11.5px]" style={{ color: "var(--ink-2)" }}>Investimento contratado</div>
            <div className="text-[20px] font-semibold mt-1" style={{ color: "var(--ink)" }}>
              {fmtBRL(GOALS.youtube.investimento)}
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "var(--cr-yt-soft)" }}>
            <div className="text-[11.5px]" style={{ color: "var(--ink-2)" }}>Visualizações contratadas</div>
            <div className="text-[20px] font-semibold mt-1" style={{ color: "var(--ink)" }}>
              {fmtNum(GOALS.youtube.visualizacoes)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const accent = "var(--cr-yt)";

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Kpi label="Investimento" value={fmtBRL(t.investimento)} sub={`de ${fmtBRL(GOALS.youtube.investimento)}`} accent={accent} />
        <Kpi label="Visualizações" value={fmtNum(t.visualizacoes)} sub={`de ${fmtNum(GOALS.youtube.visualizacoes)}`} accent={accent} delay={40} />
        <Kpi label="CPV" value={t.visualizacoes > 0 ? fmtBRL(t.cpv, 2) : "—"} sub="Custo por visualização" accent="var(--cr-olive)" delay={80} />
        <Kpi label="Taxa de visualização" value={t.impressoes > 0 ? fmtPct(t.taxaVisualizacao) : "—"} sub="Visualizações ÷ impressões" accent="var(--cr-olive)" delay={120} />
        <div className="col-span-2 lg:col-span-1">
          <Kpi label="Impressões" value={fmtNum(t.impressoes)} sub={`CPM ${fmtBRL(t.cpm, 2)}`} accent="var(--cr-olive)" delay={160} />
        </div>
      </div>

      <ViewsMultiples days={days} />

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <div className="min-w-0">
          <RetentionCurve quartis={t.quartis} />
        </div>
        <div className="min-w-0">
          <VideoRanking videos={videos} />
        </div>
      </div>
    </div>
  );
}
