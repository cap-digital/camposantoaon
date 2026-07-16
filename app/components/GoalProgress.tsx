"use client";

import { fmtBRL, fmtNum, fmtPct } from "@/lib/metrics";

interface MeterProps {
  label: string;
  valueText: string;
  goalText: string;
  pct: number; // 0..(100+)
  reachedLabel: string; // texto quando a meta é superada (>= 100%)
}

function Meter({ label, valueText, goalText, pct, reachedLabel }: MeterProps) {
  const fill = Math.max(0, Math.min(100, pct));
  const superada = pct >= 100;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div
            className="text-[13px] font-medium"
            style={{ color: "var(--ink-2)" }}
          >
            {label}
          </div>
          <div
            className="text-[13px] tnum mt-0.5"
            style={{ color: "var(--ink-muted)" }}
          >
            {valueText}{" "}
            <span style={{ color: "var(--ink-muted)" }}>de {goalText}</span>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-2xl sm:text-3xl font-semibold leading-none tnum"
            style={{ color: superada ? "var(--status-good)" : "var(--brand)" }}
          >
            {fmtPct(pct, 0)}
          </div>
        </div>
      </div>

      <div
        className="relative h-3.5 rounded-full overflow-hidden"
        style={{ background: "rgba(138,109,53,0.14)" }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
          style={{
            width: `${fill}%`,
            background: superada
              ? "linear-gradient(90deg, #2f8f6f, #37a884)"
              : "linear-gradient(90deg, #6f5a30, #b8974f)",
          }}
        />
      </div>

      <div className="text-[11.5px]">
        <span
          style={{ color: superada ? "var(--status-good)" : "var(--ink-muted)" }}
        >
          {superada ? reachedLabel : "Em andamento"}
        </span>
      </div>
    </div>
  );
}

interface GoalProgressProps {
  investimento: number;
  cliques: number;
  goalInvestimento: number;
  goalCliques: number;
  scopeLabel?: string;
}

export default function GoalProgress({
  investimento,
  cliques,
  goalInvestimento,
  goalCliques,
  scopeLabel = "por mês",
}: GoalProgressProps) {
  return (
    <section className="cs-card cs-hover cs-rise p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <h2
          className="text-[15px] font-semibold"
          style={{ color: "var(--ink)" }}
        >
          Meta contratada
        </h2>
        <span
          className="text-[12px] px-2 py-0.5 rounded-full"
          style={{
            color: "var(--brand)",
            background: "rgba(138,109,53,0.10)",
          }}
        >
          {scopeLabel}
        </span>
      </div>

      <div className="grid gap-6 sm:gap-8 sm:grid-cols-2">
        <Meter
          label="Investimento"
          valueText={fmtBRL(investimento)}
          goalText={fmtBRL(goalInvestimento)}
          pct={goalInvestimento > 0 ? (investimento / goalInvestimento) * 100 : 0}
          reachedLabel="Meta alcançada"
        />
        <Meter
          label="Cliques"
          valueText={fmtNum(cliques)}
          goalText={fmtNum(goalCliques)}
          pct={goalCliques > 0 ? (cliques / goalCliques) * 100 : 0}
          reachedLabel="Meta batida"
        />
      </div>
    </section>
  );
}
