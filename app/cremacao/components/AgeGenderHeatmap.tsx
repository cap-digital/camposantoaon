"use client";

import { useMemo, useRef, useState } from "react";
import { MetaRow } from "@/lib/cremacao/types";
import { GENDER_LABEL, ageGender } from "@/lib/cremacao/metrics";
import { fmtBRL, fmtNum, fmtPct } from "@/lib/metrics";
import { Card, CardHead, ChartTooltip, Segmented } from "./ui";

type Metric = "impressoes" | "cliques" | "investimento" | "cpm";

const LABEL: Record<Metric, string> = {
  impressoes: "Impressões",
  cliques: "Cliques",
  investimento: "Investimento",
  cpm: "CPM",
};

// Rampa sequencial de um só matiz (azul do Meta), clara → escura.
const LO = [234, 240, 247];
const HI = [29, 74, 130];
function ramp(t: number): string {
  const c = LO.map((lo, i) => Math.round(lo + (HI[i] - lo) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function fmtFor(m: Metric, v: number): string {
  if (m === "investimento") return fmtBRL(v, 2);
  if (m === "cpm") return fmtBRL(v, 2);
  return fmtNum(v);
}

export default function AgeGenderHeatmap({ rows }: { rows: MetaRow[] }) {
  const [metric, setMetric] = useState<Metric>("impressoes");
  const [hover, setHover] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; side: "left" | "right"; w: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Tooltip ao lado da célula (as células são largas demais para cobrir).
  function focusCell(key: string, el: HTMLElement) {
    setHover(key);
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wr = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const center = r.left + r.width / 2 - wr.left;
    const side = center > wr.width * 0.5 ? "left" : "right";
    setTip({
      x: side === "left" ? r.left - wr.left - 2 : r.right - wr.left + 2,
      y: r.top - wr.top + r.height / 2,
      side,
      w: wr.width,
    });
  }
  function blurCell() {
    setHover(null);
    setTip(null);
  }
  const { ages, genders, cells } = useMemo(() => ageGender(rows), [rows]);

  const val = (age: string, gender: string): number => {
    const c = cells.get(`${age}|${gender}`);
    if (!c) return 0;
    if (metric === "cpm") return c.impressoes > 0 ? (c.investimento / c.impressoes) * 1000 : 0;
    return c[metric];
  };

  // Total por faixa (margem direita).
  const rowTotal = (age: string): number => {
    let impr = 0;
    let cl = 0;
    let inv = 0;
    for (const g of genders) {
      const c = cells.get(`${age}|${g}`);
      if (!c) continue;
      impr += c.impressoes;
      cl += c.cliques;
      inv += c.investimento;
    }
    if (metric === "cpm") return impr > 0 ? (inv / impr) * 1000 : 0;
    return metric === "impressoes" ? impr : metric === "cliques" ? cl : inv;
  };

  const max = Math.max(1e-9, ...ages.flatMap((a) => genders.map((g) => val(a, g))));
  const totals = ages.map(rowTotal);
  const maxTotal = Math.max(1e-9, ...totals);

  const [hAge, hGender] = hover ? hover.split("|") : [null, null];
  const hc = hover ? cells.get(hover) : null;

  return (
    <Card delay={40}>
      <CardHead
        title="Público por idade e gênero"
        sub={`${LABEL[metric]} em cada combinação — quanto mais escuro, maior`}
        right={
          <Segmented
            label="Métrica do mapa de calor"
            value={metric}
            onChange={setMetric}
            options={(Object.keys(LABEL) as Metric[]).map((k) => ({ key: k, label: LABEL[k] }))}
          />
        }
      />

      <div ref={wrapRef} className="relative">
        <div className="overflow-x-auto -mx-1 px-1">
          <div
            className="grid gap-[3px] min-w-[420px]"
            style={{ gridTemplateColumns: `64px repeat(${genders.length}, minmax(0, 1fr)) minmax(90px, 1.1fr)` }}
            role="table"
            aria-label="Mapa de calor por idade e gênero"
          >
            <div />
            {genders.map((g) => (
              <div key={g} className="text-[11.5px] font-medium text-center pb-1" style={{ color: "var(--ink-2)" }}>
                {GENDER_LABEL[g] ?? g}
              </div>
            ))}
            <div className="text-[11.5px] font-medium pb-1 pl-2" style={{ color: "var(--ink-2)" }}>
              Total da faixa
            </div>

            {ages.map((a, ai) => (
              <div key={a} className="contents" role="row">
                <div className="text-[12px] font-medium flex items-center tnum" style={{ color: "var(--ink-2)" }}>
                  {a}
                </div>
                {genders.map((g) => {
                  const v = val(a, g);
                  const t = v / max;
                  const key = `${a}|${g}`;
                  const dark = t > 0.5;
                  return (
                    <div
                      key={g}
                      role="cell"
                      tabIndex={0}
                      onMouseEnter={(e) => focusCell(key, e.currentTarget)}
                      onMouseLeave={blurCell}
                      onFocus={(e) => focusCell(key, e.currentTarget)}
                      onBlur={blurCell}
                      className="h-11 rounded-md flex items-center justify-center text-[12px] font-medium tnum transition-[outline] outline-none"
                      style={{
                        background: v > 0 ? ramp(0.08 + t * 0.92) : "rgba(33,29,20,0.035)",
                        color: v > 0 ? (dark ? "#fff" : "var(--ink)") : "var(--ink-muted)",
                        outline: hover === key ? "2px solid var(--ink)" : "none",
                        outlineOffset: 1,
                      }}
                    >
                      {v > 0 ? fmtFor(metric, v) : "—"}
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 pl-2 min-w-0">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(33,29,20,0.06)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(totals[ai] / maxTotal) * 100}%`, background: "var(--cr-meta)" }}
                    />
                  </div>
                  <span className="text-[11.5px] tnum w-[64px] text-right shrink-0" style={{ color: "var(--ink-2)" }}>
                    {fmtFor(metric, totals[ai])}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {hc && tip && (
          <ChartTooltip
            x={tip.x}
            y={tip.y}
            width={tip.w}
            side={tip.side}
            title={`${hAge} · ${GENDER_LABEL[hGender!] ?? hGender}`}
            rows={[
              { label: "Impressões", value: fmtNum(hc.impressoes) },
              { label: "Cliques", value: fmtNum(hc.cliques) },
              { label: "Investimento", value: fmtBRL(hc.investimento, 2) },
              { label: "CPM", value: fmtBRL(hc.impressoes > 0 ? (hc.investimento / hc.impressoes) * 1000 : 0, 2) },
              { label: "CTR", value: fmtPct(hc.impressoes > 0 ? (hc.cliques / hc.impressoes) * 100 : 0, 2) },
            ]}
          />
        )}
      </div>

      {/* escala */}
      <div className="mt-4 flex items-center gap-2 text-[11px]" style={{ color: "var(--ink-muted)" }}>
        <span>menor</span>
        <span
          className="h-2 w-28 rounded-full"
          style={{ background: `linear-gradient(90deg, ${ramp(0.08)}, ${ramp(1)})` }}
          aria-hidden
        />
        <span>maior</span>
      </div>

    </Card>
  );
}
