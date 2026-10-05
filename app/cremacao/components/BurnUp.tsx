"use client";

import { useMemo, useState } from "react";
import { GOALS, PLATFORM_INFO, Platform } from "@/lib/cremacao/types";
import { CrDay, niceMax } from "@/lib/cremacao/metrics";
import { fmtBRL, fmtCompact, fmtNum } from "@/lib/metrics";
import { useWidth } from "@/app/components/useWidth";
import {
  Card,
  CardHead,
  ChartTooltip,
  DataLabels,
  Legend,
  Segmented,
  placeLabels,
  textBox,
  xLabelIndexes,
} from "./ui";

type Metric = "investimento" | "impressoes" | "visualizacoes";

const LABEL: Record<Metric, string> = {
  investimento: "Investimento",
  impressoes: "Impressões",
  visualizacoes: "Visualizações",
};

// Área empilhada do acumulado por plataforma ao longo de todo o período,
// com a meta contratada como linha de referência.
export default function BurnUp({
  days,
  platforms,
  lastIndex,
}: {
  days: CrDay[]; // período completo
  platforms: Platform[];
  lastIndex: number; // último dia com dados (−1 se nenhum)
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const single = platforms.length === 1 ? platforms[0] : null;
  const options: Metric[] = single
    ? ["investimento", single === "meta" ? "impressoes" : "visualizacoes"]
    : ["investimento"];
  const [metricSel, setMetric] = useState<Metric>("investimento");
  const metric = options.includes(metricSel) ? metricSel : "investimento";
  const [hover, setHover] = useState<number | null>(null);

  const goal = platforms.reduce((s, p) => {
    const g = GOALS[p] as Record<string, number>;
    return s + (g[metric] ?? 0);
  }, 0);

  const fmt = (v: number) => (metric === "investimento" ? fmtBRL(v) : fmtNum(v));

  // Acumulado por plataforma (só até o último dia com dados).
  const cum = useMemo(() => {
    const out: Record<Platform, number[]> = { meta: [], youtube: [] };
    for (const p of platforms) {
      let acc = 0;
      days.forEach((d, i) => {
        acc += d[p][metric];
        out[p][i] = i <= lastIndex ? acc : NaN;
      });
    }
    return out;
  }, [days, platforms, metric, lastIndex]);

  const height = 260; // igual nos dois cartões lado a lado da Visão geral
  const padL = 54;
  const padR = 14;
  const padT = 16;
  const padB = 28;
  const w = Math.max(width, 280);
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;

  const totalAt = (i: number) => platforms.reduce((s, p) => s + (cum[p][i] || 0), 0);
  const current = lastIndex >= 0 ? totalAt(lastIndex) : 0;
  const yMax = niceMax(Math.max(goal * 1.1, current, 1));
  const x = (i: number) => padL + (days.length <= 1 ? innerW / 2 : (i / (days.length - 1)) * innerW);
  const y = (v: number) => padT + innerH - (v / yMax) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * yMax);
  const xIdx = xLabelIndexes(days.length, Math.max(3, Math.floor(innerW / 70)));

  // Bandas empilhadas: cada plataforma ocupa de (soma anterior) a (soma até ela).
  const bands = useMemo(() => {
    if (lastIndex < 0) return [];
    const idx = Array.from({ length: lastIndex + 1 }, (_, i) => i);
    const base = idx.map(() => 0);
    return platforms.map((p) => {
      const lower = [...base];
      const upper = idx.map((i) => base[i] + (cum[p][i] || 0));
      upper.forEach((v, i) => (base[i] = v));
      const top = idx.map((i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(upper[i]).toFixed(1)}`).join(" ");
      const bottom = [...idx].reverse().map((i) => `L ${x(i).toFixed(1)} ${y(lower[i]).toFixed(1)}`).join(" ");
      // Um único dia vira uma faixa estreita para continuar visível.
      const area = idx.length === 1
        ? `M ${x(0) - 3} ${y(upper[0])} L ${x(0) + 3} ${y(upper[0])} L ${x(0) + 3} ${y(lower[0])} L ${x(0) - 3} ${y(lower[0])} Z`
        : `${top} ${bottom} Z`;
      return { p, area, top, endY: y(upper[lastIndex]) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cum, platforms, lastIndex, w, yMax]);

  // Rótulos do acumulado: fim de cada semana e último dia com dados, sem
  // encostar no rótulo da meta.
  const goalText = `Meta ${fmt(goal)}`;
  const goalLabelX = w - padR - (goalText.length * 11 * 0.6) / 2;
  const labels =
    lastIndex >= 0
      ? placeLabels(
          days
            .map((_, i) => i)
            .filter((i) => i <= lastIndex && (i === lastIndex || i % 7 === 6))
            .map((i) => ({
              x: x(i),
              y: y(totalAt(i)) - 9,
              text: metric === "investimento" ? `R$${fmtCompact(totalAt(i))}` : fmtCompact(totalAt(i)),
              priority: i === lastIndex ? 3 : 1,
            })),
          { x0: padL, x1: w - padR },
          [textBox(goalLabelX, y(goal) - 6, goalText, 11)],
        )
      : [];

  function move(clientX: number, rect: DOMRect) {
    const rel = (clientX - rect.left - padL) / innerW;
    const i = Math.round(rel * (days.length - 1));
    setHover(Math.max(0, Math.min(days.length - 1, i)));
  }

  const hd = hover != null ? days[hover] : null;
  const hasHoverData = hover != null && hover <= lastIndex;

  return (
    <Card delay={120} className="h-full flex flex-col">
      <CardHead
        title="Acumulado rumo à meta"
        sub={`${LABEL[metric]} acumulado · meta ${fmt(goal)}`}
        right={
          options.length > 1 ? (
            <Segmented
              label="Métrica do acumulado"
              value={metric}
              onChange={setMetric}
              options={options.map((k) => ({ key: k, label: LABEL[k] }))}
            />
          ) : undefined
        }
      />
      <Legend
        items={[
          ...platforms.map((p) => ({ label: PLATFORM_INFO[p].label, color: PLATFORM_INFO[p].color })),
          { label: "Meta contratada", color: "var(--ink-2)", kind: "dash" as const },
        ]}
      />
      <div ref={ref} className="relative w-full select-none mt-auto pt-2" style={{ touchAction: "pan-y" }}>
        {width > 0 && (
          <svg
            width={w}
            height={height}
            role="img"
            aria-label={`${LABEL[metric]} acumulado comparado à meta`}
            onMouseMove={(e) => move(e.clientX, e.currentTarget.getBoundingClientRect())}
            onMouseLeave={() => setHover(null)}
            onTouchStart={(e) => move(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
            onTouchMove={(e) => move(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
          >
            {ticks.map((t, i) => (
              <g key={i}>
                <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--grid)" />
                <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10.5" className="tnum" fill="var(--ink-muted)">
                  {metric === "investimento" ? `R$${fmtCompact(t)}` : fmtCompact(t)}
                </text>
              </g>
            ))}

            {bands.map((b) => (
              <g key={b.p}>
                <path d={b.area} fill={PLATFORM_INFO[b.p].color} fillOpacity={0.22} />
                <path d={b.top} fill="none" stroke={PLATFORM_INFO[b.p].color} strokeWidth={2} strokeLinejoin="round" />
              </g>
            ))}

            {/* meta contratada */}
            <line x1={padL} x2={w - padR} y1={y(goal)} y2={y(goal)} stroke="var(--ink-2)" strokeWidth={1.5} strokeDasharray="2 4" strokeLinecap="round" />
            <text x={w - padR} y={y(goal) - 6} textAnchor="end" fontSize="11" fontWeight={600} fill="var(--ink-2)">
              {goalText}
            </text>

            {lastIndex >= 0 && (
              <circle cx={x(lastIndex)} cy={y(current)} r={4.5} fill="var(--ink)" stroke="var(--cr-surface)" strokeWidth={2} />
            )}
            <DataLabels labels={labels} />

            {hover != null && (
              <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + innerH} stroke="rgba(33,29,20,0.28)" />
            )}

            {days.map((d, i) =>
              xIdx.has(i) ? (
                <text key={d.date} x={x(i)} y={height - 8} textAnchor="middle" fontSize="10.5" fill="var(--ink-muted)">
                  {d.label}
                </text>
              ) : null,
            )}
          </svg>
        )}
        {hd && (
          <ChartTooltip
            x={x(hover!)}
            y={hasHoverData ? Math.max(padT + 24, y(totalAt(hover!))) : padT + innerH / 2}
            width={w}
            title={hd.label}
            rows={
              hasHoverData
                ? [
                    ...platforms.map((p) => ({
                      label: PLATFORM_INFO[p].label,
                      value: fmt(cum[p][hover!] || 0),
                      color: PLATFORM_INFO[p].color,
                    })),
                    ...(platforms.length > 1 ? [{ label: "Total", value: fmt(totalAt(hover!)) }] : []),
                    { label: "da meta", value: `${Math.round((totalAt(hover!) / goal) * 100)}%` },
                  ]
                : [{ label: "Ainda sem dados", value: "" }]
            }
          />
        )}
      </div>
    </Card>
  );
}
