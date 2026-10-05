"use client";

import { MetaTotals } from "@/lib/cremacao/metrics";
import { fmtBRL, fmtNum } from "@/lib/metrics";
import { Card, CardHead, HoverTip } from "./ui";

// Ações geradas pelos anúncios, em pirulitos horizontais (uma série, uma cor).
export default function EngagementLollipop({ totals }: { totals: MetaTotals }) {
  const hasVideo = totals.videoPlays > 0 || totals.thruplays > 0;
  const items = [
    { label: "Engajamentos no post", value: totals.engajamento },
    { label: "Cliques", value: totals.cliques },
    { label: "Reações", value: totals.reacoes },
    { label: "Comentários", value: totals.comentarios },
    { label: "Salvamentos", value: totals.salvamentos },
    ...(hasVideo
      ? [
          { label: "Reproduções de vídeo", value: totals.videoPlays },
          { label: "ThruPlays", value: totals.thruplays },
        ]
      : []),
  ].sort((a, b) => b.value - a.value);

  const max = Math.max(1, ...items.map((i) => i.value));
  const perMil = (v: number) =>
    totals.impressoes > 0 ? (v / totals.impressoes) * 1000 : 0;

  return (
    <Card delay={120} className="h-full">
      <CardHead
        title="Interações geradas"
        sub="Total no período e taxa por mil impressões"
      />
      <ul className="flex flex-col gap-3.5 mt-1">
        {items.map((it) => {
          const pct = (it.value / max) * 100;
          return (
            <li key={it.label}>
              <HoverTip
                className="grid items-center gap-x-3"
                style={{ gridTemplateColumns: "minmax(0,150px) 1fr auto" }}
                title={it.label}
                rows={[
                  { label: "Total", value: fmtNum(it.value), color: "var(--cr-meta)" },
                  { label: "Por mil impressões", value: perMil(it.value).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) },
                  { label: "Custo por ação", value: it.value > 0 ? fmtBRL(totals.investimento / it.value, 2) : "—" },
                ]}
              >
                <span className="text-[12.5px] truncate" style={{ color: "var(--ink-2)" }}>
                  {it.label}
                </span>
                <div className="relative h-4" aria-hidden>
                  <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: "var(--grid)" }} />
                  {it.value > 0 && (
                    <>
                      <div
                        className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 rounded-full"
                        style={{ width: `calc(${pct}% - 5px)`, background: "var(--cr-meta)", transition: "width 0.6s" }}
                      />
                      <div
                        className="absolute top-1/2 h-[11px] w-[11px] -translate-y-1/2 -translate-x-1/2 rounded-full"
                        style={{ left: `calc(${pct}% - 5px)`, background: "var(--cr-meta)", boxShadow: "0 0 0 2px var(--cr-surface)" }}
                      />
                    </>
                  )}
                </div>
                <span className="text-right whitespace-nowrap">
                  <span className="text-[13px] font-semibold tnum" style={{ color: "var(--ink)" }}>
                    {fmtNum(it.value)}
                  </span>
                  <span className="text-[11px] tnum ml-1.5" style={{ color: "var(--ink-muted)" }}>
                    {perMil(it.value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}‰
                  </span>
                </span>
              </HoverTip>
            </li>
          );
        })}
      </ul>
      {!hasVideo && (
        <p className="text-[11.5px] mt-4" style={{ color: "var(--ink-muted)" }}>
          Sem reproduções de vídeo no período — métricas de vídeo ocultas.
        </p>
      )}
    </Card>
  );
}
