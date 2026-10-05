"use client";

import { useMemo, useState } from "react";
import { PLATFORM_INFO, Platform } from "@/lib/cremacao/types";
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
  barPath,
  placeLabels,
  seriesPriority,
  textBox,
  xLabelIndexes,
} from "./ui";

type MetricKey = "investimento" | "impressoes" | "visualizacoes";

const METRIC_LABEL: Record<MetricKey, string> = {
  investimento: "Investimento",
  impressoes: "Impressões",
  visualizacoes: "Visualizações",
};

const OPTIONS: MetricKey[] = ["investimento", "impressoes", "visualizacoes"];
const MA_COLOR = "#2a2520";
const MA_WINDOW = 7;

// Colunas empilhadas por plataforma + linha de média móvel de 7 dias.
// Uma única escala (mesma unidade nas duas marcas) — sem eixo duplo.
export default function DailyCombo({
  days,
  platforms,
}: {
  days: CrDay[];
  platforms: Platform[];
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [m, setMetric] = useState<MetricKey>("investimento");
  const [hover, setHover] = useState<number | null>(null);

  // Visualizações só existem no YouTube.
  const shown = useMemo(
    () => (m === "visualizacoes" ? platforms.filter((p) => p === "youtube") : platforms),
    [m, platforms],
  );

  const fmt = (v: number) => (m === "investimento" ? fmtBRL(v, 2) : fmtNum(v));
  const fmtLabel = (v: number) => (m === "investimento" ? `R$${fmtCompact(v)}` : fmtCompact(v));

  const series = useMemo(() => {
    const totals = days.map((d) => shown.reduce((s, p) => s + d[p][m], 0));
    const ma = totals.map((_, i) => {
      const from = Math.max(0, i - MA_WINDOW + 1);
      const slice = totals.slice(from, i + 1);
      return slice.reduce((s, v) => s + v, 0) / slice.length;
    });
    return { totals, ma };
  }, [days, shown, m]);

  const height = 260; // igual nos dois cartões lado a lado da Visão geral
  const padL = 50;
  const padR = 12;
  const padT = 22; // espaço para o rótulo da coluna mais alta
  const padB = 28;
  const w = Math.max(width, 280);
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;
  const yMax = niceMax(Math.max(1, ...series.totals, ...series.ma));
  const band = innerW / Math.max(1, days.length);
  const barW = Math.min(24, band * 0.64);
  const cx = (i: number) => padL + band * i + band / 2;
  const y = (v: number) => padT + innerH - (v / yMax) * innerH;
  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => t * yMax);
  const xIdx = xLabelIndexes(days.length, Math.max(3, Math.floor(innerW / 70)));

  const maPath = series.ma
    .map((v, i) => `${i === 0 ? "M" : "L"} ${cx(i).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(" ");

  // Rótulos: total no topo de cada coluna; média só no último ponto (à direita
  // da coluna, para não disputar o mesmo lugar). Colisões são descartadas.
  const last = days.length - 1;
  let maTag: { x: number; y: number; text: string } | null = null;
  if (days.length > 0) {
    const text = `média ${fmtLabel(series.ma[last])}`;
    const half = (text.length * 10.5 * 0.6) / 2;
    const right = cx(last) + barW / 2 + 6 + half;
    const left = cx(last) - barW / 2 - 6 - half;
    const x = right + half <= w - padR ? right : left;
    maTag = { x, y: y(series.ma[last]) + 3.5, text };
  }
  const labels = placeLabels(
    series.totals.map((v, i) => ({
      x: cx(i),
      y: y(v) - 6,
      text: v > 0 ? fmtLabel(v) : "",
      priority: v > 0 ? seriesPriority(series.totals, i) : -1,
    })).filter((c) => c.text),
    { x0: padL, x1: w - padR },
    maTag ? [textBox(maTag.x, maTag.y, maTag.text)] : [],
  );

  function move(clientX: number, rect: DOMRect) {
    if (days.length === 0) return;
    const i = Math.floor((clientX - rect.left - padL) / band);
    setHover(Math.max(0, Math.min(days.length - 1, i)));
  }

  const hd = hover != null ? days[hover] : null;

  return (
    <Card delay={60} className="h-full flex flex-col">
      <CardHead
        title="Entrega diária"
        sub={`${METRIC_LABEL[m]} por dia, com média móvel de ${MA_WINDOW} dias`}
        right={
          <Segmented
            label="Métrica"
            value={m}
            onChange={setMetric}
            options={OPTIONS.map((k) => ({ key: k, label: METRIC_LABEL[k] }))}
          />
        }
      />
      <Legend
        items={[
          ...shown.map((p) => ({ label: PLATFORM_INFO[p].label, color: PLATFORM_INFO[p].color })),
          { label: `Média ${MA_WINDOW} dias`, color: MA_COLOR, kind: "line" as const },
        ]}
      />
      <div ref={ref} className="relative w-full select-none mt-auto pt-2" style={{ touchAction: "pan-y" }}>
        {width > 0 && (
          <svg
            width={w}
            height={height}
            role="img"
            aria-label={`${METRIC_LABEL[m]} diário por plataforma`}
            onMouseMove={(e) => move(e.clientX, e.currentTarget.getBoundingClientRect())}
            onMouseLeave={() => setHover(null)}
            onTouchStart={(e) => move(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
            onTouchMove={(e) => move(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
          >
            {ticks.map((t, i) => (
              <g key={i}>
                <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--grid)" />
                <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10.5" className="tnum" fill="var(--ink-muted)">
                  {fmtLabel(t)}
                </text>
              </g>
            ))}

            {hover != null && (
              <rect x={padL + band * hover} y={padT} width={band} height={innerH} fill="rgba(33,29,20,0.05)" />
            )}

            {days.map((d, i) => {
              let acc = 0;
              const segs = shown.map((p) => {
                const v = d[p][m];
                const y0 = y(acc);
                acc += v;
                return { p, v, y0, y1: y(acc) };
              });
              const visible = segs.filter((s) => s.v > 0);
              return (
                <g key={d.date}>
                  {visible.map((s, k) => {
                    const isTop = k === visible.length - 1;
                    // 2px de folga entre segmentos empilhados
                    const top = s.y1;
                    const bottom = k === 0 ? s.y0 : s.y0 - 2;
                    const h = Math.max(0, bottom - top);
                    const x0 = cx(i) - barW / 2;
                    return isTop ? (
                      <path key={s.p} d={barPath(x0, top, barW, h)} fill={PLATFORM_INFO[s.p].color} />
                    ) : (
                      <rect key={s.p} x={x0} y={top} width={barW} height={h} fill={PLATFORM_INFO[s.p].color} />
                    );
                  })}
                </g>
              );
            })}

            {days.length > 1 && (
              <path d={maPath} fill="none" stroke={MA_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            )}
            {days.length > 0 && (
              <circle cx={cx(last)} cy={y(series.ma[last])} r={4} fill={MA_COLOR} stroke="var(--cr-surface)" strokeWidth={2} />
            )}

            <DataLabels labels={labels} />
            {maTag && <DataLabels labels={[maTag]} fill="var(--ink-2)" />}

            {days.map((d, i) =>
              xIdx.has(i) ? (
                <text key={d.date} x={cx(i)} y={height - 8} textAnchor="middle" fontSize="10.5" fill="var(--ink-muted)">
                  {d.label}
                </text>
              ) : null,
            )}
          </svg>
        )}
        {hd && (
          <ChartTooltip
            x={cx(hover!)}
            y={Math.max(padT + 20, y(series.totals[hover!]))}
            width={w}
            title={hd.label}
            rows={[
              ...shown.map((p) => ({ label: PLATFORM_INFO[p].label, value: fmt(hd[p][m]), color: PLATFORM_INFO[p].color })),
              ...(shown.length > 1 ? [{ label: "Total", value: fmt(series.totals[hover!]) }] : []),
              { label: `Média ${MA_WINDOW}d`, value: fmt(series.ma[hover!]), color: MA_COLOR },
            ]}
          />
        )}
      </div>
    </Card>
  );
}
