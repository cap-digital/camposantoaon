"use client";

import { useState } from "react";

export interface RateItem {
  label: string;
  value: number;
  formatted: string;
  max: number; // máximo histórico entre os meses (para a escala da barra)
  kind: "rate" | "cost";
  hint: string;
}

export default function RateBars({ items }: { items: RateItem[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="cs-card cs-hover cs-rise p-5 sm:p-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-[15px] font-semibold"
            style={{ color: "var(--ink)" }}
          >
            Taxas e custos
          </h2>
          <p className="text-[12.5px]" style={{ color: "var(--ink-muted)" }}>
            Barra proporcional ao maior valor do período
          </p>
        </div>
        <div
          className="hidden sm:flex items-center gap-3 text-[11px]"
          style={{ color: "var(--ink-muted)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--cat-3)" }}
            />
            Taxa
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--cat-2)" }}
            />
            Custo
          </span>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-3.5">
        {items.map((it, i) => {
          const color = it.kind === "rate" ? "var(--cat-3)" : "var(--cat-2)";
          const pct = it.max > 0 ? Math.min(100, (it.value / it.max) * 100) : 0;
          const on = active === i;
          return (
            <li
              key={it.label}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              className="cursor-default"
            >
              <div className="flex items-baseline justify-between mb-1">
                <span
                  className="text-[13px] font-medium"
                  style={{ color: "var(--ink-2)" }}
                >
                  {it.label}
                  <span
                    className="ml-1.5 text-[11px]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {it.hint}
                  </span>
                </span>
                <span
                  className="text-[14px] font-semibold tnum"
                  style={{ color: "var(--ink)" }}
                >
                  {it.formatted}
                </span>
              </div>
              <div
                className="h-2.5 rounded-full overflow-hidden"
                style={{ background: "rgba(138,109,53,0.12)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(3, pct)}%`,
                    background: color,
                    opacity: active == null || on ? 1 : 0.5,
                    filter: on ? "saturate(1.15)" : "none",
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
