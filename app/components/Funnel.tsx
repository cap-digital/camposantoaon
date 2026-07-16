"use client";

import { useState } from "react";
import { fmtNum, fmtPct } from "@/lib/metrics";

interface Stage {
  label: string;
  value: number;
  color: string;
}

export default function Funnel({
  impressoes,
  cliques,
  conversoes,
}: {
  impressoes: number;
  cliques: number;
  conversoes: number;
}) {
  const [active, setActive] = useState<number | null>(null);

  const stages: Stage[] = [
    { label: "Impressões", value: impressoes, color: "var(--cat-1)" },
    { label: "Cliques", value: cliques, color: "var(--brand)" },
    { label: "Conversões", value: conversoes, color: "var(--cat-4)" },
  ];

  const max = Math.max(1, impressoes);
  const minW = 42; // largura mínima (%) — garante espaço para o rótulo caber

  // Taxas de passagem entre etapas.
  const steps = [
    cliques > 0 && impressoes > 0
      ? { label: "CTR", pct: (cliques / impressoes) * 100 }
      : null,
    conversoes > 0 && cliques > 0
      ? { label: "Conversão", pct: (conversoes / cliques) * 100 }
      : null,
  ];

  return (
    <section className="cs-card cs-hover cs-rise p-5 sm:p-6 h-full">
      <h2 className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
        Funil de conversão
      </h2>
      <p className="text-[12.5px] mb-4" style={{ color: "var(--ink-muted)" }}>
        Da exibição à conversão
      </p>

      <div className="flex flex-col gap-1.5">
        {stages.map((s, i) => {
          const w = minW + (1 - minW / 100) * (s.value / max) * 100;
          const on = active === i;
          return (
            <div key={s.label}>
              <div
                className="mx-auto rounded-lg flex items-center justify-center transition-all duration-300 cursor-default"
                style={{
                  width: `${w}%`,
                  height: 52,
                  background: s.color,
                  opacity: active == null || on ? 1 : 0.55,
                  transform: on ? "scale(1.03)" : "scale(1)",
                  boxShadow: on
                    ? "0 8px 20px -8px rgba(52,40,14,0.55)"
                    : "none",
                }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <div className="text-center leading-tight px-2">
                  <div className="text-white text-[17px] font-semibold tnum">
                    {fmtNum(s.value)}
                  </div>
                  <div className="text-white/85 text-[11px]">{s.label}</div>
                </div>
              </div>

              {/* taxa de passagem entre etapas */}
              {i < stages.length - 1 && steps[i] && (
                <div className="flex items-center justify-center py-0.5">
                  <span
                    className="text-[11px] tnum px-2 py-0.5 rounded-full"
                    style={{
                      color: "var(--ink-2)",
                      background: "rgba(138,109,53,0.10)",
                    }}
                  >
                    ↓ {steps[i]!.label} {fmtPct(steps[i]!.pct)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
