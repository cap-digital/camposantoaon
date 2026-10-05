"use client";

import { useMemo } from "react";
import { GOALS, MetaRow, PERIOD, PLATFORM_INFO, Platform, YtRow } from "@/lib/cremacao/types";
import {
  dailySeries,
  daysBetween,
  lastDataDate,
  sumMeta,
  sumYt,
} from "@/lib/cremacao/metrics";
import { fmtBRL, fmtNum } from "@/lib/metrics";
import GoalRings from "./GoalRings";
import DailyCombo from "./DailyCombo";
import BurnUp from "./BurnUp";
import { Kpi } from "./ui";

const PLATFORMS: Platform[] = ["meta", "youtube"];

export default function OverviewTab({
  meta,
  youtube,
  today,
}: {
  meta: MetaRow[];
  youtube: YtRow[];
  today: string;
}) {
  const mT = useMemo(() => sumMeta(meta), [meta]);
  const yT = useMemo(() => sumYt(youtube), [youtube]);

  const last = lastDataDate(meta, youtube);

  // Série do período completo (área acumulada) e recorte até hoje/último dado
  // (colunas diárias), sempre começando no início da campanha.
  const full = useMemo(
    () => dailySeries(meta, youtube, PERIOD.start, PERIOD.end),
    [meta, youtube],
  );
  const lastIndex = last ? Math.min(full.length - 1, daysBetween(PERIOD.start, last)) : -1;
  const upTo = Math.min(
    full.length - 1,
    Math.max(lastIndex, daysBetween(PERIOD.start, today)),
  );
  const daily = full.slice(0, Math.max(1, upTo + 1));

  const invest = mT.investimento + yT.investimento;
  const goalInvest = GOALS.meta.investimento + GOALS.youtube.investimento;
  const impressoes = mT.impressoes + yT.impressoes;
  const cpm = impressoes > 0 ? (invest / impressoes) * 1000 : 0;

  const kpis = [
    { label: "Investimento total", value: fmtBRL(invest), sub: `de ${fmtBRL(goalInvest)} contratados`, accent: "var(--cr-accent)" },
    { label: "Impressões", value: fmtNum(impressoes), sub: "Meta Ads + YouTube", accent: "var(--cr-accent)" },
    { label: "Visualizações YouTube", value: fmtNum(yT.visualizacoes), sub: yT.visualizacoes > 0 ? `CPV ${fmtBRL(yT.cpv, 2)}` : "Aguardando entrega", accent: PLATFORM_INFO.youtube.color },
    { label: "CPM médio", value: impressoes > 0 ? fmtBRL(cpm, 2) : "—", sub: "Custo por mil impressões", accent: "var(--cr-olive)" },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <GoalRings platforms={PLATFORMS} meta={mT} yt={yT} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k, i) => (
          <Kpi key={k.label} {...k} delay={i * 40} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <DailyCombo days={daily} platforms={PLATFORMS} />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <BurnUp days={full} platforms={PLATFORMS} lastIndex={lastIndex} />
        </div>
      </div>
    </div>
  );
}
