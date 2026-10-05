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
  barPath,
  placeLabels,
  seriesPriority,
  xLabelIndexes,
} from "./ui";

const INV_COLOR = "var(--cr-meta)";
const IMP_COLOR = "var(--cr-c3)";

// Investimento (barras) e impressões (linha) por dia, em dois painéis
// empilhados com o mesmo eixo X — cada métrica com a sua escala, sem eixo duplo.
export default function MetaDaily({ days }: { days: CrDay[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const padL = 50;
  const padR = 12;
  const titleH = 18; // título de cada painel
  const labelRoom = 16; // espaço para o rótulo do valor mais alto
  const panelH = 104;
  const top1 = titleH + labelRoom;
  const top2 = top1 + panelH + 26 + titleH + labelRoom;
  const height = top2 + panelH + 26;
  const w = Math.max(width, 260);
  const innerW = w - padL - padR;
  const band = innerW / Math.max(1, days.length);
  const barW = Math.min(24, band * 0.62);
  const cx = (i: number) => padL + band * i + band / 2;

  const inv = days.map((d) => d.meta.investimento);
  const imp = days.map((d) => d.meta.impressoes);
  const invMax = niceMax(Math.max(1, ...inv));
  const impMax = niceMax(Math.max(1, ...imp));
  const yInv = (v: number) => top1 + panelH - (v / invMax) * panelH;
  const yImp = (v: number) => top2 + panelH - (v / impMax) * panelH;
  const steps = [0, 0.5, 1];
  const xIdx = xLabelIndexes(days.length, Math.max(3, Math.floor(innerW / 64)));
  const bounds = { x0: padL, x1: w - padR };

  const line = imp
    .map((v, i) => `${i === 0 ? "M" : "L"} ${cx(i).toFixed(1)} ${yImp(v).toFixed(1)}`)
    .join(" ");

  const invLabels = placeLabels(
    inv
      .map((v, i) => ({ x: cx(i), y: yInv(v) - 6, text: `R$${fmtCompact(v)}`, priority: seriesPriority(inv, i) }))
      .filter((_, i) => inv[i] > 0),
    bounds,
  );
  const impLabels = placeLabels(
    imp
      .map((v, i) => ({ x: cx(i), y: yImp(v) - 9, text: fmtCompact(v), priority: seriesPriority(imp, i) }))
      .filter((_, i) => imp[i] > 0),
    bounds,
  );

  function move(clientX: number, rect: DOMRect) {
    if (days.length === 0) return;
    const i = Math.floor((clientX - rect.left - padL) / band);
    setHover(Math.max(0, Math.min(days.length - 1, i)));
  }

  const hd = hover != null ? days[hover] : null;

  const panelTitle = (y: number, color: string, label: string, kind: "bar" | "line") => (
    <g>
      {kind === "bar" ? (
        <rect x={padL} y={y - 8} width={9} height={9} rx={2} fill={color} />
      ) : (
        <line x1={padL} x2={padL + 12} y1={y - 3.5} y2={y - 3.5} stroke={color} strokeWidth={2} strokeLinecap="round" />
      )}
      <text x={padL + (kind === "bar" ? 14 : 17)} y={y} fontSize="11.5" fontWeight={600} fill="var(--ink-2)">
        {label}
      </text>
    </g>
  );

  return (
    <Card delay={80} className="h-full flex flex-col">
      <CardHead title="Investimento e impressões por dia" sub="Mesmo eixo de datas, cada métrica com a sua escala" />
      <div ref={ref} className="relative w-full select-none mt-1 flex-1" style={{ touchAction: "pan-y" }}>
        {width > 0 && (
          <svg
            width={w}
            height={height}
            role="img"
            aria-label="Investimento e impressões diários do Meta Ads"
            onMouseMove={(e) => move(e.clientX, e.currentTarget.getBoundingClientRect())}
            onMouseLeave={() => setHover(null)}
            onTouchStart={(e) => move(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
            onTouchMove={(e) => move(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
          >
            {hover != null && (
              <>
                <rect x={padL + band * hover} y={top1} width={band} height={panelH} fill="rgba(33,29,20,0.05)" />
                <rect x={padL + band * hover} y={top2} width={band} height={panelH} fill="rgba(33,29,20,0.05)" />
              </>
            )}

            {/* painel 1 — investimento (barras) */}
            {panelTitle(titleH - 4, INV_COLOR, "Investimento (R$)", "bar")}
            {steps.map((t) => (
              <g key={`i${t}`}>
                <line x1={padL} x2={w - padR} y1={yInv(t * invMax)} y2={yInv(t * invMax)} stroke="var(--grid)" />
                <text x={padL - 7} y={yInv(t * invMax) + 3.5} textAnchor="end" fontSize="10.5" className="tnum" fill="var(--ink-muted)">
                  {`R$${fmtCompact(t * invMax)}`}
                </text>
              </g>
            ))}
            {inv.map((v, i) =>
              v > 0 ? (
                <path key={i} d={barPath(cx(i) - barW / 2, yInv(v), barW, top1 + panelH - yInv(v))} fill={INV_COLOR} />
              ) : null,
            )}
            <DataLabels labels={invLabels} />

            {/* painel 2 — impressões (linha) */}
            {panelTitle(top2 - labelRoom - 4, IMP_COLOR, "Impressões", "line")}
            {steps.map((t) => (
              <g key={`m${t}`}>
                <line x1={padL} x2={w - padR} y1={yImp(t * impMax)} y2={yImp(t * impMax)} stroke="var(--grid)" />
                <text x={padL - 7} y={yImp(t * impMax) + 3.5} textAnchor="end" fontSize="10.5" className="tnum" fill="var(--ink-muted)">
                  {fmtCompact(t * impMax)}
                </text>
              </g>
            ))}
            {days.length > 1 && (
              <path d={line} fill="none" stroke={IMP_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            )}
            {imp.map((v, i) =>
              days.length <= 14 || i === days.length - 1 || i === hover ? (
                <circle key={i} cx={cx(i)} cy={yImp(v)} r={hover === i ? 5 : 4} fill={IMP_COLOR} stroke="var(--cr-surface)" strokeWidth={2} />
              ) : null,
            )}
            <DataLabels labels={impLabels} />

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
            y={(top1 + top2 + panelH) / 2}
            width={w}
            title={hd.label}
            rows={[
              { label: "Investimento", value: fmtBRL(hd.meta.investimento, 2), color: INV_COLOR },
              { label: "Impressões", value: fmtNum(hd.meta.impressoes), color: IMP_COLOR },
              {
                label: "CPM",
                value: hd.meta.impressoes > 0 ? fmtBRL((hd.meta.investimento / hd.meta.impressoes) * 1000, 2) : "—",
              },
            ]}
          />
        )}
      </div>
    </Card>
  );
}
