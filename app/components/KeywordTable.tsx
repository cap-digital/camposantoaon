"use client";

import { useEffect, useMemo, useState } from "react";
import { KeywordRow } from "@/lib/types";
import { fmtNum, fmtPct } from "@/lib/metrics";

const PAGE_SIZE = 5;

type SortKey = "keyword" | "cliques" | "impressoes" | "ctr" | "conversoes";
type SortDir = "asc" | "desc";

interface Row {
  keyword: string;
  cliques: number;
  impressoes: number;
  ctr: number;
  conversoes: number;
}

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "keyword", label: "Palavra-chave", align: "left" },
  { key: "cliques", label: "Cliques", align: "right" },
  { key: "impressoes", label: "Impr.", align: "right" },
  { key: "ctr", label: "CTR", align: "right" },
  { key: "conversoes", label: "Conv.", align: "right" },
];

// Recebe as palavras já filtradas pelo mês do painel (uma linha por mês ×
// palavra) e soma por palavra — em "Todos" a mesma palavra aparece em vários meses.
export default function KeywordTable({ keywords }: { keywords: KeywordRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("cliques");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const map = new Map<string, Row>();
    for (const k of keywords) {
      const id = k.keyword.toLowerCase();
      let r = map.get(id);
      if (!r) {
        r = { keyword: k.keyword, cliques: 0, impressoes: 0, ctr: 0, conversoes: 0 };
        map.set(id, r);
      }
      r.cliques += k.clicks;
      r.impressoes += k.impressions;
      r.conversoes += k.conversions;
    }
    const out = Array.from(map.values());
    for (const r of out) r.ctr = r.impressoes > 0 ? r.cliques / r.impressoes : 0;
    return out;
  }, [keywords]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const c =
        sortKey === "keyword"
          ? a.keyword.localeCompare(b.keyword, "pt-BR")
          : a[sortKey] - b[sortKey];
      // Desempate estável: mais cliques, depois ordem alfabética.
      return c * dir || b.cliques - a.cliques || a.keyword.localeCompare(b.keyword, "pt-BR");
    });
  }, [rows, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  // Volta à primeira página quando muda o mês ou a ordenação.
  useEffect(() => setPage(0), [keywords, sortKey, sortDir]);

  const current = Math.min(page, pageCount - 1);
  const visible = sorted.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "keyword" ? "asc" : "desc");
    }
  }

  const from = sorted.length === 0 ? 0 : current * PAGE_SIZE + 1;
  const to = Math.min(sorted.length, (current + 1) * PAGE_SIZE);

  return (
    <section className="cs-card cs-hover cs-rise p-5 sm:p-6 h-full flex flex-col">
      <h2 className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
        Palavras-chave
      </h2>
      <p className="text-[12.5px] mb-3" style={{ color: "var(--ink-muted)" }}>
        Clique no título da coluna para ordenar
      </p>

      {sorted.length === 0 ? (
        <p className="text-[13px] py-6" style={{ color: "var(--ink-muted)" }}>
          Sem palavras-chave no período selecionado.
        </p>
      ) : (
        <>
          <div className="cs-scroll -mx-1 px-1">
            <table className="w-full border-collapse min-w-[440px]">
              <thead>
                <tr className="text-[11.5px] uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
                  {COLUMNS.map((col) => {
                    const on = col.key === sortKey;
                    return (
                      <th
                        key={col.key}
                        className={`font-medium pb-2 ${col.align === "left" ? "text-left" : "text-right"}`}
                        aria-sort={on ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className="inline-flex items-center gap-1 uppercase tracking-wide hover:opacity-80"
                          style={{ color: on ? "var(--ink)" : "inherit" }}
                        >
                          {col.label}
                          <span aria-hidden className="text-[10px] w-2.5 inline-block">
                            {on ? (sortDir === "asc" ? "▲" : "▼") : ""}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr
                    key={r.keyword}
                    className="border-t transition-colors hover:bg-[rgba(138,109,53,0.06)]"
                    style={{ borderColor: "var(--hairline)" }}
                  >
                    <td className="py-3 pr-3 max-w-[240px]">
                      <div
                        className="text-[13px] font-medium truncate"
                        style={{ color: "var(--ink)" }}
                        title={r.keyword}
                      >
                        {r.keyword}
                      </div>
                    </td>
                    <td className="text-right tnum font-semibold text-[13px] pr-3.5" style={{ color: "var(--ink)" }}>
                      {fmtNum(r.cliques)}
                    </td>
                    <td className="text-right tnum text-[13px] pr-3.5" style={{ color: "var(--ink-2)" }}>
                      {fmtNum(r.impressoes)}
                    </td>
                    <td className="text-right tnum text-[13px] pr-3.5" style={{ color: "var(--ink-2)" }}>
                      {fmtPct(r.ctr)}
                    </td>
                    <td className="text-right tnum text-[13px] pr-3.5" style={{ color: "var(--ink-2)" }}>
                      {fmtNum(r.conversoes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto pt-3 flex items-center justify-between gap-3">
            <span className="text-[12px] tnum" style={{ color: "var(--ink-muted)" }}>
              {from}–{to} de {fmtNum(sorted.length)}
            </span>
            <div className="flex items-center gap-2">
              <PageButton
                label="Página anterior"
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
              >
                ‹
              </PageButton>
              <span className="text-[12px] tnum" style={{ color: "var(--ink-2)" }}>
                {current + 1} / {pageCount}
              </span>
              <PageButton
                label="Próxima página"
                disabled={current >= pageCount - 1}
                onClick={() => setPage(current + 1)}
              >
                ›
              </PageButton>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="h-7 w-7 rounded-full text-[16px] leading-none flex items-center justify-center border transition-colors enabled:hover:bg-[rgba(138,109,53,0.08)] disabled:opacity-35 disabled:cursor-not-allowed"
      style={{ borderColor: "var(--hairline)", color: "var(--ink)" }}
    >
      {children}
    </button>
  );
}
