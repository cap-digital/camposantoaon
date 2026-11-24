"use client";

import { ReactNode } from "react";

// Variação contra o mês anterior. `change` é a variação relativa (0.12 = +12%);
// a seta segue a direção do número e a cor diz se a mudança é boa ou ruim
// (CPC subindo é ruim, então sai vermelho com a seta para cima).
export interface Delta {
  change: number;
  higherIsBetter: boolean;
  label: string; // "Outubro: 1.024"
}

interface StatTileProps {
  delta?: Delta | null;
  label: string;
  value: string;
  sub?: ReactNode;
  accent?: string; // cor do marcador de identidade
  delay?: number;
}

export default function StatTile({
  label,
  value,
  sub,
  accent = "var(--brand)",
  delay = 0,
  delta,
}: StatTileProps) {
  return (
    <div
      className="cs-card cs-hover cs-rise p-4 sm:p-5 flex flex-col gap-1.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
          style={{ background: accent }}
          aria-hidden
        />
        <span
          className="text-[12px] sm:text-[13px] font-medium leading-tight"
          style={{ color: "var(--ink-2)" }}
        >
          {label}
        </span>
      </div>
      <div
        className="text-2xl sm:text-[28px] font-semibold leading-none mt-0.5"
        style={{ color: "var(--ink)" }}
      >
        {value}
      </div>
      {delta && <DeltaBadge delta={delta} />}
      {sub && (
        <div
          className="text-[12px] leading-tight mt-0.5"
          style={{ color: "var(--ink-muted)" }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function DeltaBadge({ delta }: { delta: Delta }) {
  const { change, higherIsBetter, label } = delta;
  const flat = Math.abs(change) < 0.0005;
  const up = change > 0;
  const good = up === higherIsBetter;
  const color = flat ? "var(--ink-muted)" : good ? "var(--status-good)" : "var(--status-bad)";
  const pct = Math.abs(change * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <div className="flex items-center gap-1.5 flex-wrap text-[12px] leading-tight mt-0.5">
      <span
        className="inline-flex items-center gap-0.5 font-semibold tnum rounded-full px-1.5 py-0.5"
        style={{
          color,
          background: flat
            ? "rgba(138,109,53,0.08)"
            : `color-mix(in srgb, ${color} 12%, transparent)`,
        }}
        aria-label={
          flat
            ? `Estável ${label}`
            : `${up ? "Subiu" : "Caiu"} ${pct}% ${label}`
        }
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          {flat ? (
            <path d="M1.5 5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          ) : (
            <path
              d={up ? "M5 1.5v7M1.8 4.6 5 1.5l3.2 3.1" : "M5 8.5v-7M1.8 5.4 5 8.5l3.2-3.1"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </svg>
        {flat ? "0,0%" : `${up ? "+" : "−"}${pct}%`}
      </span>
      <span style={{ color: "var(--ink-muted)" }}>{label}</span>
    </div>
  );
}
