"use client";

import { useMemo } from "react";
import { GOALS, MetaRow, PERIOD } from "@/lib/cremacao/types";
import { dailySeries, daysBetween, lastDataDate, sumMeta } from "@/lib/cremacao/metrics";
import { fmtBRL, fmtNum, fmtPct } from "@/lib/metrics";
import AgeGenderHeatmap from "./AgeGenderHeatmap";
import MetaDaily from "./MetaDaily";
import EngagementLollipop from "./EngagementLollipop";
import { EmptyNote, Kpi } from "./ui";

export default function MetaTab({ meta, today }: { meta: MetaRow[]; today: string }) {
  const t = useMemo(() => sumMeta(meta), [meta]);
  // Do início da campanha até hoje (ou o último dia com dados).
  const days = useMemo(() => {
    const last = lastDataDate(meta, []) ?? today;
    const end = last > today ? last : today;
    const span = Math.min(daysBetween(PERIOD.start, PERIOD.end), Math.max(0, daysBetween(PERIOD.start, end)));
    return dailySeries(meta, [], PERIOD.start, PERIOD.end).slice(0, span + 1);
  }, [meta, today]);

  if (meta.length === 0) {
    return (
      <div className="cr-card p-6">
        <EmptyNote>O Meta Ads ainda não registrou entrega nesta campanha.</EmptyNote>
      </div>
    );
  }

  const engRate = t.impressoes > 0 ? (t.engajamento / t.impressoes) * 100 : 0;
  const accent = "var(--cr-meta)";

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Kpi label="Investimento" value={fmtBRL(t.investimento)} sub={`de ${fmtBRL(GOALS.meta.investimento)}`} accent={accent} />
        <Kpi label="Impressões" value={fmtNum(t.impressoes)} sub={`de ${fmtNum(GOALS.meta.impressoes)}`} accent={accent} delay={40} />
        <Kpi label="CPM" value={fmtBRL(t.cpm, 2)} sub="Por mil impressões" accent="var(--cr-olive)" delay={80} />
        <Kpi label="Cliques" value={fmtNum(t.cliques)} sub={`CTR ${fmtPct(t.ctr, 2)}`} accent="var(--cr-olive)" delay={120} />
        <div className="col-span-2 lg:col-span-1">
          <Kpi label="Engajamentos" value={fmtNum(t.engajamento)} sub={`Taxa ${fmtPct(engRate, 2)}`} accent="var(--cr-olive)" delay={160} />
        </div>
      </div>

      <AgeGenderHeatmap rows={meta} />

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <div className="min-w-0">
          <MetaDaily days={days} />
        </div>
        <div className="min-w-0">
          <EngagementLollipop totals={t} />
        </div>
      </div>
    </div>
  );
}
