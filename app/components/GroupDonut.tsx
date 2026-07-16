"use client";

import { useState } from "react";
import { GroupSlice, fmtNum, fmtPct, fmtBRL } from "@/lib/metrics";
import { groupColor } from "@/lib/colors";

export default function GroupDonut({ groups }: { groups: GroupSlice[] }) {
  const [active, setActive] = useState<number | null>(null);
  const total = groups.reduce((s, g) => s + g.cliques, 0) || 1;

  const size = 176;
  const cx = size / 2;
  const cy = size / 2;
  const r = 66;
  const stroke = 22;
  const circ = 2 * Math.PI * r;
  const gap = 2; // folga de 2px entre fatias (na superfície)

  let offset = 0;
  const arcs = groups.map((g) => {
    const frac = g.cliques / total;
    const len = frac * circ;
    const dash = Math.max(0, len - gap);
    const arc = {
      color: groupColor(g.raw),
      dasharray: `${dash} ${circ - dash}`,
      dashoffset: -offset,
      frac,
    };
    offset += len;
    return arc;
  });

  const focus = active != null ? groups[active] : null;

  return (
    <section className="cs-card cs-hover cs-rise p-5 sm:p-6 h-full flex flex-col">
      <h2 className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
        Cliques por grupo
      </h2>
      <p className="text-[12.5px]" style={{ color: "var(--ink-muted)" }}>
        Distribuição por palavra-chave
      </p>

      <div className="flex-1 flex flex-col sm:flex-row items-center gap-5 py-4">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} role="img" aria-label="Distribuição de cliques por grupo">
            <g transform={`rotate(-90 ${cx} ${cy})`}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="var(--grid)"
                strokeWidth={stroke}
              />
              {arcs.map((a, i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={active === i ? stroke + 3 : stroke}
                  strokeDasharray={a.dasharray}
                  strokeDashoffset={a.dashoffset}
                  strokeLinecap="butt"
                  style={{
                    transition: "stroke-width 0.15s",
                    opacity: active == null || active === i ? 1 : 0.4,
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                />
              ))}
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="text-[11px]"
              style={{ color: "var(--ink-muted)" }}
            >
              {focus ? focus.name : "Total"}
            </span>
            <span
              className="text-[22px] font-semibold tnum leading-none mt-0.5"
              style={{ color: "var(--ink)" }}
            >
              {focus ? fmtNum(focus.cliques) : fmtNum(total)}
            </span>
            <span
              className="text-[11px] tnum mt-0.5"
              style={{ color: "var(--ink-muted)" }}
            >
              {focus
                ? fmtPct((focus.cliques / total) * 100, 0) + " dos cliques"
                : "cliques"}
            </span>
          </div>
        </div>

        <ul className="flex-1 w-full flex flex-col gap-2">
          {groups.map((g, i) => (
            <li
              key={g.raw}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors cursor-default"
              style={{
                background: active === i ? "rgba(138,109,53,0.07)" : "transparent",
              }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: groupColor(g.raw) }}
              />
              <span
                className="text-[13px] flex-1 truncate"
                style={{ color: "var(--ink-2)" }}
                title={g.name}
              >
                {g.name}
              </span>
              <span
                className="text-[13px] font-semibold tnum"
                style={{ color: "var(--ink)" }}
              >
                {fmtNum(g.cliques)}
              </span>
              <span
                className="text-[11.5px] tnum w-16 text-right"
                style={{ color: "var(--ink-muted)" }}
              >
                {fmtBRL(g.investimento)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
