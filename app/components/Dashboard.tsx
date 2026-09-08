"use client";

import { useMemo, useState } from "react";
import { RawRow, GOAL_CLIQUES, GOAL_INVESTIMENTO, MONTH_INDEX } from "@/lib/types";
import {
  computeTotals,
  computeDaily,
  computeByGroup,
  computeByAd,
  computeByMonth,
  fmtBRL,
  fmtNum,
  fmtPct,
} from "@/lib/metrics";
import MonthFilter from "./MonthFilter";
import GoalProgress from "./GoalProgress";
import StatTile from "./StatTile";
import DailyChart from "./DailyChart";
import GroupDonut from "./GroupDonut";
import AdTable from "./AdTable";
import MonthCompare from "./MonthCompare";
import Funnel from "./Funnel";
import RateBars, { RateItem } from "./RateBars";

const ALL = "Todos";

interface DashboardProps {
  google: RawRow[];
  google2: RawRow[];
  currentMonth: string | null;
  updatedAt: string | null;
  ok: boolean;
}

function Monogram() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="10"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="1.4"
      />
      <path
        d="M20 8.5 L30 16 V31 H10 V16 Z"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M20 5.5 V10 M17.8 7.4 H22.2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M17 31 V23 a3 3 0 0 1 6 0 V31"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function Dashboard({
  google,
  google2,
  currentMonth,
  updatedAt,
  ok,
}: DashboardProps) {
  const allRows = useMemo(() => [...google, ...google2], [google, google2]);

  const monthSummaries = useMemo(
    () => computeByMonth(allRows, currentMonth),
    [allRows, currentMonth],
  );

  // Totais por mês (usados para escalar as barras de taxas/custos).
  const monthlyTotals = useMemo(
    () =>
      monthSummaries.map((m) =>
        computeTotals(allRows.filter((r) => r.Mes === m.mes)),
      ),
    [monthSummaries, allRows],
  );

  const defaultMonth =
    currentMonth ??
    (monthSummaries.length > 0
      ? monthSummaries[monthSummaries.length - 1].mes
      : "");

  const [selected, setSelected] = useState(defaultMonth);
  const isAll = selected === ALL;

  const rows = useMemo(
    () => (isAll ? allRows : allRows.filter((r) => r.Mes === selected)),
    [allRows, selected, isAll],
  );

  const totals = useMemo(() => computeTotals(rows), [rows]);
  const daily = useMemo(() => computeDaily(rows), [rows]);
  const groups = useMemo(() => computeByGroup(rows), [rows]);
  const ads = useMemo(() => computeByAd(rows), [rows]);

  // Meses do recorte atual sem detalhamento por anúncio — a aba do mês corrente
  // deixou de trazer a coluna de anúncio, então a tabela cai para o nível de
  // grupo em vez de ficar vazia.
  const monthsWithoutAds = useMemo(() => {
    const all = new Set<string>();
    const withAds = new Set<string>();
    for (const r of rows) {
      all.add(r.Mes);
      if (r.ad_name) withAds.add(r.Mes);
    }
    return Array.from(all)
      .filter((m) => !withAds.has(m))
      .sort((a, b) => (MONTH_INDEX[a] ?? 99) - (MONTH_INDEX[b] ?? 99));
  }, [rows]);

  const nMonths = Math.max(1, monthSummaries.length);

  // Meta soma-se ao selecionar "Todos os meses".
  const goalInvest = isAll ? GOAL_INVESTIMENTO * nMonths : GOAL_INVESTIMENTO;
  const goalClicks = isAll ? GOAL_CLIQUES * nMonths : GOAL_CLIQUES;

  // Escala das barras: maior valor entre os meses (e o valor atual).
  const rateItems: RateItem[] = useMemo(() => {
    const maxOf = (sel: (t: (typeof monthlyTotals)[number]) => number, cur: number) =>
      Math.max(cur, ...monthlyTotals.map(sel), 0.0001);
    return [
      {
        label: "CTR",
        value: totals.ctr,
        formatted: fmtPct(totals.ctr),
        max: maxOf((t) => t.ctr, totals.ctr),
        kind: "rate",
        hint: "cliques/impr.",
      },
      {
        label: "Taxa de conversão",
        value: totals.taxaConversao,
        formatted: fmtPct(totals.taxaConversao),
        max: maxOf((t) => t.taxaConversao, totals.taxaConversao),
        kind: "rate",
        hint: "conv./cliques",
      },
      {
        label: "CPC",
        value: totals.cpc,
        formatted: fmtBRL(totals.cpc, 2),
        max: maxOf((t) => t.cpc, totals.cpc),
        kind: "cost",
        hint: "por clique",
      },
      {
        label: "CPM",
        value: totals.cpm,
        formatted: fmtBRL(totals.cpm, 2),
        max: maxOf((t) => t.cpm, totals.cpm),
        kind: "cost",
        hint: "por mil impr.",
      },
      {
        label: "Custo por conversão",
        value: totals.custoConversao,
        formatted: totals.conversoes > 0 ? fmtBRL(totals.custoConversao, 2) : "—",
        max: maxOf((t) => t.custoConversao, totals.custoConversao),
        kind: "cost",
        hint: "por conversão",
      },
    ];
  }, [totals, monthlyTotals]);

  const hasData = ok && allRows.length > 0;

  // Meses anteriores (mais recente primeiro) para o dropdown do filtro.
  const previousMonths = useMemo(
    () =>
      monthSummaries
        .filter((m) => m.mes !== currentMonth)
        .map((m) => m.mes)
        .reverse(),
    [monthSummaries, currentMonth],
  );

  return (
    <main className="min-h-screen w-full">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Cabeçalho */}
        <header className="relative z-50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6">
          <div className="flex items-center gap-3.5">
            <Monogram />
            <div>
              <h1
                className="text-white text-2xl sm:text-[32px] font-bold leading-[1.05] tracking-tight"
                style={{ textShadow: "0 1px 3px rgba(52,38,12,0.30)" }}
              >
                Cemitério Campo Santo
              </h1>
              <p
                className="text-[13px] sm:text-sm leading-tight mt-1 font-medium uppercase tracking-[0.14em]"
                style={{ color: "rgba(255,255,255,0.82)" }}
              >
                Painel de Campanhas · Google Pesquisa
              </p>
            </div>
          </div>
          {hasData && (
            <MonthFilter
              currentMonth={currentMonth}
              previousMonths={previousMonths}
              selected={selected}
              onSelect={setSelected}
              allValue={ALL}
            />
          )}
        </header>

        {!hasData ? (
          <div className="cs-card p-8 text-center">
            <p className="text-[15px] font-medium" style={{ color: "var(--ink)" }}>
              Não foi possível carregar os dados no momento.
            </p>
            <p className="text-[13px] mt-1" style={{ color: "var(--ink-muted)" }}>
              Atualize a página em instantes.
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            <GoalProgress
              investimento={totals.investimento}
              cliques={totals.cliques}
              goalInvestimento={goalInvest}
              goalCliques={goalClicks}
              scopeLabel={isAll ? `acumulado · ${nMonths} meses` : "por mês"}
            />

            {/* KPIs — 4 cartões */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile
                label="Investimento"
                value={fmtBRL(totals.investimento)}
                accent="var(--brand-gold)"
                sub={`Meta ${fmtBRL(goalInvest)}`}
                delay={0}
              />
              <StatTile
                label="Cliques"
                value={fmtNum(totals.cliques)}
                accent="var(--brand)"
                sub={`Meta ${fmtNum(goalClicks)}`}
                delay={40}
              />
              <StatTile
                label="CTR"
                value={fmtPct(totals.ctr)}
                accent="var(--cat-3)"
                sub="Cliques ÷ impressões"
                delay={80}
              />
              <StatTile
                label="CPC médio"
                value={fmtBRL(totals.cpc, 2)}
                accent="var(--cat-2)"
                sub="Custo por clique"
                delay={120}
              />
            </div>

            <DailyChart data={daily} />

            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
              <div className="min-w-0">
                <GroupDonut groups={groups} />
              </div>
              <div className="min-w-0">
                <AdTable
                  ads={ads}
                  groups={groups}
                  missingMonths={monthsWithoutAds}
                />
              </div>
            </div>

            <MonthCompare
              months={monthSummaries}
              selected={selected}
              onSelect={setSelected}
            />

            {/* Funil (40%) + Taxas e custos (60%) */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5">
              <div className="min-w-0 lg:col-span-2">
                <Funnel
                  impressoes={totals.impressoes}
                  cliques={totals.cliques}
                  conversoes={totals.conversoes}
                />
              </div>
              <div className="min-w-0 lg:col-span-3">
                <RateBars items={rateItems} />
              </div>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <footer
          className="mt-8 pt-5 text-[12px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ color: "rgba(255,255,255,0.78)", borderTop: "1px solid rgba(255,255,255,0.18)" }}
        >
          <span>
            Largo do Campo Santo, S/N · Federação, Salvador — BA · Estratégia:
            Pesquisa
          </span>
          {updatedAt && (
            <span className="tnum">
              Atualizado em{" "}
              {new Date(updatedAt).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </footer>
      </div>
    </main>
  );
}
