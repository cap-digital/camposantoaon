"use client";

import { useState } from "react";
import { MonthSummary, fmtNum, fmtBRL } from "@/lib/metrics";
import { GOAL_CLIQUES, GOAL_INVESTIMENTO } from "@/lib/types";

type Key = "cliques" | "investimento";

export default function MonthCompare({
  months,
  selected,
  onSelect,
}: {
  months: MonthSummary[];
  selected: string;
  onSelect: (m: string) => void;
}) {
  const [metric, setMetric] = useState<Key>("cliques");
  const goal = metric === "cliques" ? GOAL_CLIQUES : GOAL_INVESTIMENTO;
  const fmt = metric === "cliques" ? fmtNum : (v: number) => fmtBRL(v);

  const maxVal = Math.max(goal, ...months.map((m) => m[metric])) * 1.08;
  const goalY = (1 - goal / maxVal) * 100;

  return (
    <section className="cs-card cs-hover cs-rise p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
            Comparativo por mês
          </h2>
          <p className="text-[12.5px]" style={{ color: "var(--ink-muted)" }}>
            Toque numa coluna para filtrar. Linha tracejada = meta contratada.
          </p>
        </div>
        <div
          className="inline-flex rounded-full p-0.5"
          style={{ background: "rgba(138,109,53,0.10)" }}
        >
          {(["cliques", "investimento"] as Key[]).map((k) => {
            const active = k === metric;
            return (
              <button
                key={k}
                onClick={() => setMetric(k)}
                className="px-3 py-1.5 rounded-full text-[12.5px] font-medium capitalize transition-colors"
                style={{
                  background: active ? "#fff" : "transparent",
                  color: active ? "var(--ink)" : "var(--ink-2)",
                  boxShadow: active ? "0 1px 3px rgba(60,48,20,0.14)" : "none",
                }}
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>

      {/* área do gráfico — barras e linha de meta compartilham a mesma escala */}
      <div className="relative" style={{ height: 190 }}>
        <div
          className="absolute left-0 right-0 border-t border-dashed z-10 pointer-events-none"
          style={{ top: `${goalY}%`, borderColor: "rgba(33,29,20,0.4)" }}
        >
          <span
            className="absolute -top-2.5 right-0 text-[11px] tnum px-1.5 rounded"
            style={{ color: "var(--ink-2)", background: "rgba(255,255,255,0.75)" }}
          >
            meta {fmt(goal)}
          </span>
        </div>

        <div className="absolute inset-0 flex items-end justify-between gap-2 sm:gap-4">
          {months.map((mo) => {
            const h = (mo[metric] / maxVal) * 100;
            const isSel = mo.mes === selected;
            const reached = mo[metric] >= goal;
            return (
              <button
                key={mo.mes}
                onClick={() => onSelect(mo.mes)}
                className="group relative flex-1 flex justify-center items-end h-full min-w-0"
                aria-label={`Ver ${mo.mes}`}
              >
                <div
                  className="rounded-t-md transition-all duration-500 relative"
                  style={{
                    width: "min(40px, 72%)",
                    height: `max(4px, ${h}%)`,
                    background: isSel
                      ? "linear-gradient(180deg,#b8974f,#6f5a30)"
                      : reached
                        ? "rgba(47,143,111,0.5)"
                        : "rgba(138,109,53,0.28)",
                  }}
                >
                  <span
                    className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full text-[11px] tnum font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--ink)" }}
                  >
                    {metric === "investimento"
                      ? "R$" + fmtNum(mo[metric])
                      : fmtNum(mo[metric])}
                  </span>
                  {mo.isCurrent && (
                    <span
                      className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[9px] whitespace-nowrap rotate-90 origin-center opacity-70"
                      style={{ color: "#fff" }}
                    >
                      parcial
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* rótulos dos meses */}
      <div className="flex justify-between gap-2 sm:gap-4 mt-2">
        {months.map((mo) => {
          const isSel = mo.mes === selected;
          return (
            <button
              key={mo.mes}
              onClick={() => onSelect(mo.mes)}
              className="flex-1 text-[11.5px] truncate min-w-0"
              style={{
                color: isSel ? "var(--brand)" : "var(--ink-2)",
                fontWeight: isSel ? 700 : 500,
              }}
            >
              {mo.mes}
            </button>
          );
        })}
      </div>
    </section>
  );
}
