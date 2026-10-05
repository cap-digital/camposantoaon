"use client";

import { useState } from "react";
import { fmtPct } from "@/lib/metrics";
import { useWidth } from "@/app/components/useWidth";
import { Card, CardHead, ChartTooltip, EmptyNote } from "./ui";

// Curva de retenção: quanto do público chegou a 25/50/75/100% do vídeo.
export default function RetentionCurve({
  quartis,
}: {
  quartis: [number, number, number, number] | null;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const height = 220;
  const padL = 40;
  const padR = 18;
  const padT = 26;
  const padB = 28;
  const w = Math.max(width, 240);
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;

  const pts = quartis ?? [0, 0, 0, 0];
  const yMax = Math.max(0.0001, Math.min(1, Math.ceil(Math.max(...pts) * 10) / 10 || 1));
  const x = (i: number) => padL + (i / 3) * innerW;
  const y = (v: number) => padT + innerH - (v / yMax) * innerH;

  // Curva suave (Catmull-Rom → Bézier) pelos quatro quartis.
  const P = pts.map((v, i) => [x(i), y(v)] as const);
  let d = `M ${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[Math.min(P.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  const area = `${d} L ${x(3)} ${padT + innerH} L ${x(0)} ${padT + innerH} Z`;
  const ticks = [0, 0.5, 1].map((t) => t * yMax);

  return (
    <Card delay={80} className="h-full">
      <CardHead title="Retenção do vídeo" sub="Parcela das impressões que assistiu até cada ponto" />
      {!quartis ? (
        <EmptyNote>A planilha ainda não traz as colunas de quartil (25/50/75/100%).</EmptyNote>
      ) : (
        <div ref={ref} className="relative w-full select-none">
          {width > 0 && (
            <svg width={w} height={height} role="img" aria-label="Curva de retenção por quartil">
              <defs>
                <linearGradient id="cr-ret" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--cr-yt)" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="var(--cr-yt)" stopOpacity="0.03" />
                </linearGradient>
              </defs>
              {ticks.map((t, i) => (
                <g key={i}>
                  <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--grid)" />
                  <text x={padL - 7} y={y(t) + 3.5} textAnchor="end" fontSize="10.5" className="tnum" fill="var(--ink-muted)">
                    {fmtPct(t * 100, 0)}
                  </text>
                </g>
              ))}
              <path d={area} fill="url(#cr-ret)" />
              <path d={d} fill="none" stroke="var(--cr-yt)" strokeWidth={2} strokeLinecap="round" />
              {pts.map((v, i) => (
                <g
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "default" }}
                >
                  <rect x={x(i) - 22} y={padT - 20} width={44} height={innerH + 20} fill="transparent" />
                  <line x1={x(i)} x2={x(i)} y1={y(v)} y2={padT + innerH} stroke="var(--grid)" />
                  <circle cx={x(i)} cy={y(v)} r={hover === i ? 6 : 4.5} fill="var(--cr-yt)" stroke="var(--cr-surface)" strokeWidth={2} />
                  <text
                    x={x(i)}
                    y={y(v) - 11}
                    textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"}
                    fontSize="12"
                    fontWeight={600}
                    fill="var(--ink)"
                  >
                    {fmtPct(v * 100, 1)}
                  </text>
                  <text x={x(i)} y={height - 8} textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"} fontSize="10.5" fill="var(--ink-muted)">
                    {["25%", "50%", "75%", "100%"][i]}
                    {w >= 420 ? " do vídeo" : ""}
                  </text>
                </g>
              ))}
            </svg>
          )}
          {hover != null && quartis && (
            <ChartTooltip
              x={x(hover)}
              y={y(pts[hover])}
              width={w}
              title={`${["25%", "50%", "75%", "100%"][hover]} do vídeo`}
              rows={[
                { label: "Assistiram até aqui", value: fmtPct(pts[hover] * 100, 1), color: "var(--cr-yt)" },
                ...(hover > 0
                  ? [{ label: "Saíram desde o quartil anterior", value: `${fmtPct((pts[hover - 1] - pts[hover]) * 100, 1).replace("%", "")} p.p.` }]
                  : []),
              ]}
            />
          )}
        </div>
      )}
    </Card>
  );
}
