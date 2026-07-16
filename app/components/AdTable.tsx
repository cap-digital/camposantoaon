"use client";

import { AdRow, fmtNum, fmtPct, fmtBRL } from "@/lib/metrics";

export default function AdTable({ ads }: { ads: AdRow[] }) {
  return (
    <section className="cs-card cs-hover cs-rise p-5 sm:p-6 h-full">
      <h2 className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
        Desempenho por anúncio
      </h2>
      <p className="text-[12.5px] mb-3" style={{ color: "var(--ink-muted)" }}>
        Ordenado por cliques
      </p>

      <div className="cs-scroll -mx-1 px-1">
        <table className="w-full border-collapse min-w-[440px]">
          <thead>
            <tr className="text-[11.5px] uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
              <th className="text-left font-medium pb-2">Anúncio</th>
              <th className="text-right font-medium pb-2">Cliques</th>
              <th className="text-right font-medium pb-2">Impr.</th>
              <th className="text-right font-medium pb-2">CTR</th>
              <th className="text-right font-medium pb-2">CPC</th>
              <th className="text-right font-medium pb-2">Invest.</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((a) => (
              <tr
                key={a.name}
                className="border-t transition-colors hover:bg-[rgba(138,109,53,0.06)]"
                style={{ borderColor: "var(--hairline)" }}
              >
                <td className="py-3 pr-3 max-w-[220px]">
                  <div
                    className="text-[13px] font-medium truncate"
                    style={{ color: "var(--ink)" }}
                    title={a.name}
                  >
                    {a.short}
                  </div>
                </td>
                <td className="text-right tnum font-semibold text-[13px]" style={{ color: "var(--ink)" }}>
                  {fmtNum(a.cliques)}
                </td>
                <td className="text-right tnum text-[13px]" style={{ color: "var(--ink-2)" }}>
                  {fmtNum(a.impressoes)}
                </td>
                <td className="text-right tnum text-[13px]" style={{ color: "var(--ink-2)" }}>
                  {fmtPct(a.ctr)}
                </td>
                <td className="text-right tnum text-[13px]" style={{ color: "var(--ink-2)" }}>
                  {fmtBRL(a.cpc, 2)}
                </td>
                <td className="text-right tnum text-[13px]" style={{ color: "var(--ink-2)" }}>
                  {fmtBRL(a.investimento)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
