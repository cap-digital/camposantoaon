"use client";

import { useState } from "react";
import { PLATFORM_INFO } from "@/lib/cremacao/types";
import { Creative, niceMax, shortAdName } from "@/lib/cremacao/metrics";
import { fmtBRL, fmtNum, fmtPct } from "@/lib/metrics";
import { useWidth } from "@/app/components/useWidth";
import { Card, CardHead, ChartTooltip, DataLabels, Legend, placeLabels } from "./ui";

// Bolhas: custo (CPM) × resposta (CTR), tamanho = impressões, cor = plataforma.
// Bom criativo fica no canto superior esquerdo (barato e com mais cliques).
export default function CreativeScatter({
  items,
  onOpen,
}: {
  items: Creative[];
  onOpen: (c: Creative) => void;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<string | null>(null);

  const height = 260;
  const padL = 48;
  const padR = 18;
  const padT = 16;
  const padB = 38;
  const w = Math.max(width, 280);
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;

  const pts = items.filter((c) => c.impressoes > 0);
  const xMax = niceMax(Math.max(...pts.map((c) => c.cpm), 0.01) * 1.15);
  const yMax = niceMax(Math.max(...pts.map((c) => c.ctr), 0.01) * 1.15);
  const maxImpr = Math.max(1, ...pts.map((c) => c.impressoes));
  const x = (v: number) => padL + (v / xMax) * innerW;
  const y = (v: number) => padT + innerH - (v / yMax) * innerH;
  const rad = (impr: number) => 6 + Math.sqrt(impr / maxImpr) * 16;
  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1];
  const platforms = Array.from(new Set(pts.map((c) => c.platform)));

  const h = pts.find((c) => c.key === hover) ?? null;

  // Nome curto acima de cada bolha; as maiores têm prioridade e as que
  // colidiriam ficam só no tooltip.
  const bubbleLabels = placeLabels(
    pts.map((c) => ({
      x: x(c.cpm),
      y: y(c.ctr) - rad(c.impressoes) - 6,
      text: shortAdName(c.name).slice(0, 24),
      priority: c.impressoes,
    })),
    { x0: padL, x1: w - padR },
    pts.map((c) => {
      const r = rad(c.impressoes);
      return [x(c.cpm) - r, y(c.ctr) - r, x(c.cpm) + r, y(c.ctr) + r] as [number, number, number, number];
    }),
  );

  return (
    <Card>
      <CardHead
        title="Custo × resposta por criativo"
        sub="CPM no eixo horizontal, CTR no vertical · bolha maior = mais impressões"
      />
      {platforms.length > 1 && (
        <Legend items={platforms.map((p) => ({ label: PLATFORM_INFO[p].label, color: PLATFORM_INFO[p].color }))} />
      )}
      <div ref={ref} className="relative w-full select-none mt-2">
        {width > 0 && (
          <svg width={w} height={height} role="img" aria-label="Dispersão de criativos por CPM e CTR">
            {ticks.map((t) => (
              <g key={`y${t}`}>
                <line x1={padL} x2={w - padR} y1={y(t * yMax)} y2={y(t * yMax)} stroke="var(--grid)" />
                <text x={padL - 7} y={y(t * yMax) + 3.5} textAnchor="end" fontSize="10.5" className="tnum" fill="var(--ink-muted)">
                  {fmtPct(t * yMax, yMax < 1 ? 1 : 0)}
                </text>
              </g>
            ))}
            {ticks.map((t) => (
              <text key={`x${t}`} x={x(t * xMax)} y={padT + innerH + 16} textAnchor="middle" fontSize="10.5" className="tnum" fill="var(--ink-muted)">
                {fmtBRL(t * xMax, Number.isInteger(t * xMax) ? 0 : 2)}
              </text>
            ))}
            <text x={padL + innerW / 2} y={height - 4} textAnchor="middle" fontSize="11" fill="var(--ink-2)">
              CPM (custo por mil impressões)
            </text>
            <line x1={padL} x2={padL} y1={padT} y2={padT + innerH} stroke="var(--grid)" />

            {[...pts]
              .sort((a, b) => b.impressoes - a.impressoes)
              .map((c) => {
                const active = hover === c.key;
                return (
                  <g
                    key={c.key}
                    onMouseEnter={() => setHover(c.key)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => onOpen(c)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle cx={x(c.cpm)} cy={y(c.ctr)} r={Math.max(14, rad(c.impressoes) + 4)} fill="transparent" />
                    <circle
                      cx={x(c.cpm)}
                      cy={y(c.ctr)}
                      r={rad(c.impressoes)}
                      fill={PLATFORM_INFO[c.platform].color}
                      fillOpacity={active ? 0.95 : 0.75}
                      stroke="var(--cr-surface)"
                      strokeWidth={2}
                    />
                  </g>
                );
              })}
            <DataLabels labels={bubbleLabels} />
          </svg>
        )}
        {h && (
          <ChartTooltip
            x={x(h.cpm) + (x(h.cpm) > w * 0.55 ? -rad(h.impressoes) : rad(h.impressoes))}
            y={y(h.ctr)}
            width={w}
            title={shortAdName(h.name)}
            rows={[
              { label: PLATFORM_INFO[h.platform].label, value: "", color: PLATFORM_INFO[h.platform].color },
              { label: "CPM", value: fmtBRL(h.cpm, 2) },
              { label: "CTR", value: fmtPct(h.ctr, 2) },
              { label: "Impressões", value: fmtNum(h.impressoes) },
              { label: "Investimento", value: fmtBRL(h.investimento, 2) },
            ]}
          />
        )}
      </div>
      <p className="mt-2 text-[12px]" style={{ color: "var(--ink-muted)" }}>
        Clique numa bolha para abrir o preview do criativo.
      </p>
    </Card>
  );
}
