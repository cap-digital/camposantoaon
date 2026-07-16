"use client";

import { useMemo, useState } from "react";
import { DayPoint, fmtBRL, fmtNum } from "@/lib/metrics";
import { useWidth } from "./useWidth";

type MetricKey = "cliques" | "investimento" | "impressoes";

const METRICS: Record<
  MetricKey,
  { label: string; color: string; fmt: (v: number) => string }
> = {
  cliques: { label: "Cliques", color: "var(--brand)", fmt: (v) => fmtNum(v) },
  investimento: {
    label: "Investimento",
    color: "var(--cat-2)",
    fmt: (v) => fmtBRL(v),
  },
  impressoes: {
    label: "Impressões",
    color: "var(--cat-1)",
    fmt: (v) => fmtNum(v),
  },
};

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

export default function DailyChart({ data }: { data: DayPoint[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [metric, setMetric] = useState<MetricKey>("cliques");
  const [hover, setHover] = useState<number | null>(null);

  const m = METRICS[metric];
  const height = 260;
  const padL = 46;
  const padR = 16;
  const padT = 18;
  const padB = 30;

  const w = Math.max(width, 280);
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;

  const values = data.map((d) => d[metric]);
  const rawMax = Math.max(1, ...values);
  const yMax = niceMax(rawMax);

  const x = (i: number) =>
    data.length <= 1
      ? padL + innerW / 2
      : padL + (i / (data.length - 1)) * innerW;
  const y = (v: number) => padT + innerH - (v / yMax) * innerH;

  const { linePath, areaPath } = useMemo(() => {
    if (data.length === 0) return { linePath: "", areaPath: "" };
    let line = "";
    data.forEach((d, i) => {
      line += `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d[metric]).toFixed(1)} `;
    });
    const area =
      `M ${x(0).toFixed(1)} ${(padT + innerH).toFixed(1)} ` +
      data
        .map((d, i) => `L ${x(i).toFixed(1)} ${y(d[metric]).toFixed(1)} `)
        .join("") +
      `L ${x(data.length - 1).toFixed(1)} ${(padT + innerH).toFixed(1)} Z`;
    return { linePath: line, areaPath: area };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, metric, w]);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * yMax);

  // Rótulos do eixo X: ~6 marcas espaçadas, sempre incluindo a última sem
  // que ela colida com a marca anterior.
  const xLabelEvery = Math.max(1, Math.ceil(data.length / 6));
  const xLabelIdx = new Set<number>();
  for (let i = 0; i < data.length; i += xLabelEvery) xLabelIdx.add(i);
  if (data.length > 1) {
    const last = data.length - 1;
    const rem = last % xLabelEvery; // distância até a marca anterior
    // se a última ficaria colada na marca anterior, remove a anterior
    if (rem > 0 && rem < Math.ceil(xLabelEvery / 2)) xLabelIdx.delete(last - rem);
    xLabelIdx.add(last);
  }

  const gradId = `grad-${metric}`;

  function handleMove(clientX: number, rect: DOMRect) {
    const px = clientX - rect.left;
    if (data.length === 0) return;
    const rel = (px - padL) / innerW;
    const idx = Math.round(rel * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, idx)));
  }

  const hp = hover != null ? data[hover] : null;

  return (
    <section className="cs-card cs-hover cs-rise p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div>
          <h2
            className="text-[15px] font-semibold"
            style={{ color: "var(--ink)" }}
          >
            Evolução diária
          </h2>
          <p className="text-[12.5px]" style={{ color: "var(--ink-muted)" }}>
            {m.label} por dia
          </p>
        </div>
        <div
          className="inline-flex rounded-full p-0.5"
          style={{ background: "rgba(138,109,53,0.10)" }}
          role="tablist"
          aria-label="Métrica do gráfico"
        >
          {(Object.keys(METRICS) as MetricKey[]).map((k) => {
            const active = k === metric;
            return (
              <button
                key={k}
                role="tab"
                aria-selected={active}
                onClick={() => setMetric(k)}
                className="px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-colors"
                style={{
                  background: active ? "#fff" : "transparent",
                  color: active ? "var(--ink)" : "var(--ink-2)",
                  boxShadow: active ? "0 1px 3px rgba(60,48,20,0.14)" : "none",
                }}
              >
                {METRICS[k].label}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={ref} className="w-full select-none" style={{ touchAction: "pan-y" }}>
        {w > 0 && (
          <svg
            width={w}
            height={height}
            role="img"
            aria-label={`Gráfico de ${m.label} por dia`}
            onMouseMove={(e) =>
              handleMove(e.clientX, e.currentTarget.getBoundingClientRect())
            }
            onMouseLeave={() => setHover(null)}
            onTouchStart={(e) =>
              handleMove(
                e.touches[0].clientX,
                e.currentTarget.getBoundingClientRect(),
              )
            }
            onTouchMove={(e) =>
              handleMove(
                e.touches[0].clientX,
                e.currentTarget.getBoundingClientRect(),
              )
            }
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={m.color} stopOpacity="0.20" />
                <stop offset="100%" stopColor={m.color} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* grade horizontal + rótulos Y */}
            {ticks.map((t, i) => (
              <g key={i}>
                <line
                  x1={padL}
                  x2={w - padR}
                  y1={y(t)}
                  y2={y(t)}
                  stroke="var(--grid)"
                  strokeWidth={1}
                />
                <text
                  x={padL - 8}
                  y={y(t) + 3.5}
                  textAnchor="end"
                  fontSize="10.5"
                  className="tnum"
                  fill="var(--ink-muted)"
                >
                  {metric === "investimento"
                    ? "R$" + fmtNum(t)
                    : fmtNum(t)}
                </text>
              </g>
            ))}

            {/* rótulos X */}
            {data.map((d, i) =>
              xLabelIdx.has(i) ? (
                <text
                  key={i}
                  x={x(i)}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="10.5"
                  fill="var(--ink-muted)"
                >
                  {d.dateLabel.slice(0, 5)}
                </text>
              ) : null,
            )}

            <path d={areaPath} fill={`url(#${gradId})`} />
            <path
              d={linePath}
              fill="none"
              stroke={m.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* ponto final */}
            {data.length > 0 && (
              <circle
                cx={x(data.length - 1)}
                cy={y(data[data.length - 1][metric])}
                r={4}
                fill={m.color}
                stroke="#fff"
                strokeWidth={2}
              />
            )}

            {/* crosshair + hover */}
            {hp && (
              <g>
                <line
                  x1={x(hover!)}
                  x2={x(hover!)}
                  y1={padT}
                  y2={padT + innerH}
                  stroke="rgba(33,29,20,0.28)"
                  strokeWidth={1}
                />
                <circle
                  cx={x(hover!)}
                  cy={y(hp[metric])}
                  r={5}
                  fill={m.color}
                  stroke="#fff"
                  strokeWidth={2.5}
                />
              </g>
            )}
          </svg>
        )}
      </div>

      {/* tooltip abaixo do gráfico — estável em mobile */}
      <div
        className="mt-2 h-6 text-[12.5px] flex items-center gap-2"
        style={{ color: "var(--ink-2)" }}
      >
        {hp ? (
          <>
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: m.color }}
            />
            <span className="tnum" style={{ color: "var(--ink-muted)" }}>
              {hp.dateLabel}
            </span>
            <span className="font-semibold tnum" style={{ color: "var(--ink)" }}>
              {m.fmt(hp[metric])}
            </span>
          </>
        ) : (
          <span style={{ color: "var(--ink-muted)" }}>
            Passe o cursor ou toque no gráfico para ver o dia
          </span>
        )}
      </div>
    </section>
  );
}
