"use client";

import { AdRow, GroupSlice, fmtNum, fmtPct, fmtBRL } from "@/lib/metrics";

interface Row {
  key: string;
  label: string; // texto exibido
  full: string; // texto completo (title)
  cliques: number;
  impressoes: number;
  ctr: number;
  cpc: number;
  investimento: number;
}

interface AdTableProps {
  ads: AdRow[];
  // Usado quando o período selecionado não tem detalhamento por anúncio:
  // a aba do mês corrente deixou de trazer a coluna de anúncio.
  groups: GroupSlice[];
  // Meses do recorte atual que não têm dados por anúncio.
  missingMonths: string[];
}

export default function AdTable({ ads, groups, missingMonths }: AdTableProps) {
  const byAd = ads.length > 0;

  const rows: Row[] = byAd
    ? ads.map((a) => ({
        key: a.name,
        label: a.short,
        full: a.name,
        cliques: a.cliques,
        impressoes: a.impressoes,
        ctr: a.ctr,
        cpc: a.cpc,
        investimento: a.investimento,
      }))
    : groups.map((g) => ({
        key: g.raw,
        label: g.name,
        full: g.name,
        cliques: g.cliques,
        impressoes: g.impressoes,
        ctr: g.ctr,
        cpc: g.cpc,
        investimento: g.investimento,
      }));

  const monthsLabel = formatList(missingMonths);
  const note = byAd
    ? missingMonths.length > 0
      ? `Não inclui ${monthsLabel} — a base do mês não traz detalhamento por anúncio.`
      : null
    : `A base ${monthsLabel ? `de ${monthsLabel} ` : ""}não traz detalhamento por anúncio.`;

  return (
    <section className="cs-card cs-hover cs-rise p-5 sm:p-6 h-full">
      <h2 className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
        {byAd ? "Desempenho por anúncio" : "Desempenho por grupo"}
      </h2>
      <p className="text-[12.5px] mb-3" style={{ color: "var(--ink-muted)" }}>
        Ordenado por cliques
      </p>

      {rows.length === 0 ? (
        <p className="text-[13px] py-6" style={{ color: "var(--ink-muted)" }}>
          Sem dados no período selecionado.
        </p>
      ) : (
        <div className="cs-scroll -mx-1 px-1">
          <table className="w-full border-collapse min-w-[440px]">
            <thead>
              <tr className="text-[11.5px] uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
                <th className="text-left font-medium pb-2">{byAd ? "Anúncio" : "Grupo"}</th>
                <th className="text-right font-medium pb-2">Cliques</th>
                <th className="text-right font-medium pb-2">Impr.</th>
                <th className="text-right font-medium pb-2">CTR</th>
                <th className="text-right font-medium pb-2">CPC</th>
                <th className="text-right font-medium pb-2">Invest.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr
                  key={a.key}
                  className="border-t transition-colors hover:bg-[rgba(138,109,53,0.06)]"
                  style={{ borderColor: "var(--hairline)" }}
                >
                  <td className="py-3 pr-3 max-w-[220px]">
                    <div
                      className="text-[13px] font-medium truncate"
                      style={{ color: "var(--ink)" }}
                      title={a.full}
                    >
                      {a.label}
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
      )}

      {note && rows.length > 0 && (
        <p className="text-[11.5px] mt-3" style={{ color: "var(--ink-muted)" }}>
          {note}
        </p>
      )}
    </section>
  );
}

// "Agosto e Setembro" / "Julho, Agosto e Setembro"
function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}
