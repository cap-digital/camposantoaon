"use client";

import { useState } from "react";
import { CrDay, niceMax } from "@/lib/cremacao/metrics";
import { fmtBRL, fmtCompact, fmtNum } from "@/lib/metrics";
import { useWidth } from "@/app/components/useWidth";
import {
  Card,
  CardHead,
  ChartTooltip,
  DataLabels,
  TipRow,
  placeLabels,
  seriesPriority,
  xLabelIndexes,
} from "./ui";

// Dois gráficos de linha pequenos lado a lado (mesmo eixo X, escalas próprias):
// visualizações por dia e custo por visualização — em vez de um eixo duplo.
function MiniLine({
  title,
  values,
  labels,
  fmtTick,
  fmtLabel,
  color,
  hover,
  onHover,
  tipRows,
}: {
  title: string;
  values: (number | null)[];
  labels: string[];
  fmtTick: (v: number) => string;
  fmtLabel: (v: number) => string;
  color: string;
  hover: number | null;
  onHover: (i: number | null) => void;
  tipRows: (i: number) => TipRow[];
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const height = 180;
  const padL = 44;
  const padR = 10;
  const padT = 22;
  const padB = 26;
  const w = Math.max(width, 220);
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;
  const nums = values.filter((v): v is number => v != null);
  const yMax = niceMax(Math.max(0, ...nums));
  const x = (i: number) => padL + (values.length <= 1 ? innerW / 2 : (i / (values.length - 1)) * innerW);
  const y = (v: number) => padT + innerH - (v / yMax) * innerH;
  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => t * yMax);
  const xIdx = xLabelIndexes(labels.length, Math.max(2, Math.floor(innerW / 64)));

  // Linha interrompida nos dias sem valor (ex.: CPV sem visualizações).
  let d = "";
  let pen = false;
  values.forEach((v, i) => {
    if (v == null) {
      pen = false;
      return;
    }
    d += `${pen ? "L" : "M"} ${x(i).toFixed(1)} ${y(v).toFixed(1)} `;
    pen = true;
  });

  const nums0 = values.map((v) => v ?? 0);
  const pointLabels = placeLabels(
    values
      .map((v, i) => (v == null ? null : { x: x(i), y: y(v) - 9, text: fmtLabel(v), priority: seriesPriority(nums0, i) }))
      .filter((c): c is NonNullable<typeof c> => c != null),
    { x0: padL, x1: w - padR },
  );

  function move(clientX: number, rect: DOMRect) {
    const rel = (clientX - rect.left - padL) / innerW;
    onHover(Math.max(0, Math.min(values.length - 1, Math.round(rel * (values.length - 1)))));
  }

  return (
    <div className="min-w-0">
      <div className="text-[12.5px] font-medium mb-1" style={{ color: "var(--ink-2)" }}>
        {title}
      </div>
      <div ref={ref} className="relative w-full select-none" style={{ touchAction: "pan-y" }}>
        {width > 0 && (
          <svg
            width={w}
            height={height}
            role="img"
            aria-label={title}
            onMouseMove={(e) => move(e.clientX, e.currentTarget.getBoundingClientRect())}
            onMouseLeave={() => onHover(null)}
            onTouchStart={(e) => move(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
            onTouchMove={(e) => move(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
          >
            {ticks.map((t, i) => (
              <g key={i}>
                <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--grid)" />
                <text x={padL - 7} y={y(t) + 3.5} textAnchor="end" fontSize="10.5" className="tnum" fill="var(--ink-muted)">
                  {fmtTick(t)}
                </text>
              </g>
            ))}
            <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {values.map((v, i) =>
              v != null && (values.length <= 14 || i === values.length - 1 || i === hover) ? (
                <circle key={i} cx={x(i)} cy={y(v)} r={hover === i ? 5 : 4} fill={color} stroke="var(--cr-surface)" strokeWidth={2} />
              ) : null,
            )}
            <DataLabels labels={pointLabels} />
            {hover != null && (
              <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + innerH} stroke="rgba(33,29,20,0.25)" />
            )}
            {labels.map((l, i) =>
              xIdx.has(i) ? (
                <text
                  key={i}
                  x={x(i)}
                  y={height - 7}
                  textAnchor={labels.length > 1 && i === labels.length - 1 ? "end" : i === 0 && labels.length > 1 ? "start" : "middle"}
                  fontSize="10.5"
                  fill="var(--ink-muted)"
                >
                  {l}
                </text>
              ) : null,
            )}
          </svg>
        )}
        {hover != null && (
          <ChartTooltip
            x={x(hover)}
            y={values[hover] != null ? Math.max(padT + 20, y(values[hover]!)) : padT + innerH / 2}
            width={w}
            title={labels[hover]}
            rows={tipRows(hover)}
          />
        )}
      </div>
    </div>
  );
}

export default function ViewsMultiples({ days }: { days: CrDay[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const labels = days.map((d) => d.label);
  const views = days.map((d) => d.youtube.visualizacoes);
  const cpv = days.map((d) =>
    d.youtube.visualizacoes > 0 ? d.youtube.investimento / d.youtube.visualizacoes : null,
  );

  return (
    <Card delay={40}>
      <CardHead title="Visualizações e custo por dia" sub="Volume entregue e quanto custou cada visualização" />
      <div className="grid gap-4 sm:grid-cols-2">
        <MiniLine
          title="Visualizações"
          values={views}
          labels={labels}
          fmtTick={fmtCompact}
          fmtLabel={fmtCompact}
          color="var(--cr-yt)"
          hover={hover}
          onHover={setHover}
          tipRows={(i) => [
            { label: "Visualizações", value: fmtNum(days[i].youtube.visualizacoes), color: "var(--cr-yt)" },
            { label: "Investimento", value: fmtBRL(days[i].youtube.investimento, 2) },
          ]}
        />
        <MiniLine
          title="CPV (R$)"
          values={cpv}
          labels={labels}
          fmtTick={(v) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          fmtLabel={(v) => fmtBRL(v, 2)}
          color="var(--ink-2)"
          hover={hover}
          onHover={setHover}
          tipRows={(i) => [
            { label: "CPV", value: cpv[i] != null ? fmtBRL(cpv[i]!, 2) : "—", color: "var(--ink-2)" },
            { label: "Visualizações", value: fmtNum(days[i].youtube.visualizacoes) },
          ]}
        />
      </div>
    </Card>
  );
}
