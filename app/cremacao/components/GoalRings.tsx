"use client";

import { GOALS, PLATFORM_INFO, Platform } from "@/lib/cremacao/types";
import { MetaTotals, YtTotals } from "@/lib/cremacao/metrics";
import { fmtBRL, fmtNum, fmtPct } from "@/lib/metrics";
import { Card, CardHead, HoverTip } from "./ui";

function Ring({
  label,
  value,
  goal,
  fmt,
  color,
  soft,
}: {
  label: string;
  value: number;
  goal: number;
  fmt: (v: number) => string;
  color: string;
  soft: string;
}) {
  const pct = goal > 0 ? (value / goal) * 100 : 0;
  const size = 116;
  const r = 47;
  const stroke = 10;
  const circ = 2 * Math.PI * r;
  const fill = Math.min(1, pct / 100) * circ;
  const done = pct >= 100;

  return (
    <HoverTip
      className="flex flex-col items-center text-center min-w-0"
      title={label}
      rows={[
        { label: "Realizado", value: fmt(value), color },
        { label: "Contratado", value: fmt(goal) },
        { label: done ? "Acima da meta" : "Falta", value: fmt(Math.abs(goal - value)) },
      ]}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          role="img"
          aria-label={`${label}: ${fmtPct(pct, 0)} da meta`}
        >
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={soft} strokeWidth={stroke} />
            {fill > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${Math.max(fill, 0.01)} ${circ}`}
                style={{ transition: "stroke-dasharray 0.7s cubic-bezier(0.22,1,0.36,1)" }}
              />
            )}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-semibold leading-none" style={{ color: "var(--ink)" }}>
            {fmtPct(pct, pct > 0 && pct < 10 ? 1 : 0)}
          </span>
          <span className="text-[10.5px] mt-1" style={{ color: done ? "var(--status-good)" : "var(--ink-muted)" }}>
            {done ? "meta atingida" : "da meta"}
          </span>
        </div>
      </div>
      <div className="mt-2 text-[13px] font-medium" style={{ color: "var(--ink-2)" }}>
        {label}
      </div>
      <div className="text-[12px] tnum" style={{ color: "var(--ink-muted)" }}>
        {fmt(value)} de {fmt(goal)}
      </div>
    </HoverTip>
  );
}

export default function GoalRings({
  platforms,
  meta,
  yt,
}: {
  platforms: Platform[];
  meta: MetaTotals;
  yt: YtTotals;
}) {
  return (
    <Card>
      <CardHead title="Metas contratadas" sub="Acumulado no período da campanha" />
      <div className={`grid gap-4 ${platforms.length > 1 ? "md:grid-cols-2" : ""}`}>
        {platforms.map((p) => {
          const info = PLATFORM_INFO[p];
          return (
            <div
              key={p}
              className="rounded-2xl p-4"
              style={{ background: "rgba(33,29,20,0.035)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: info.color }} />
                <span className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
                  {info.label}
                </span>
                <span className="text-[12px]" style={{ color: "var(--ink-muted)" }}>
                  · Estratégia de {info.strategy}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Ring
                  label="Investimento"
                  value={p === "meta" ? meta.investimento : yt.investimento}
                  goal={GOALS[p].investimento}
                  fmt={(v) => fmtBRL(v)}
                  color={info.color}
                  soft={info.soft}
                />
                {p === "meta" ? (
                  <Ring
                    label="Impressões"
                    value={meta.impressoes}
                    goal={GOALS.meta.impressoes}
                    fmt={fmtNum}
                    color={info.color}
                    soft={info.soft}
                  />
                ) : (
                  <Ring
                    label="Visualizações"
                    value={yt.visualizacoes}
                    goal={GOALS.youtube.visualizacoes}
                    fmt={fmtNum}
                    color={info.color}
                    soft={info.soft}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
