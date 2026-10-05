"use client";

import Link from "next/link";
import { useState } from "react";
import { MetaRow, PERIOD, YtRow } from "@/lib/cremacao/types";
import { dateLabel, periodInfo } from "@/lib/cremacao/metrics";
import OverviewTab from "./OverviewTab";
import MetaTab from "./MetaTab";
import YoutubeTab from "./YoutubeTab";
import CreativesTab from "./CreativesTab";
import { TABS, TabKey } from "../tabs";


interface Props {
  meta: MetaRow[];
  youtube: YtRow[];
  updatedAt: string | null;
  ok: boolean;
  today: string;
  initialTab: TabKey;
}

// Chama: marca da Cremação (no lugar do monograma da AON).
function FlameMark() {
  return (
    <svg width="48" height="48" viewBox="0 0 40 40" fill="none" aria-hidden className="shrink-0">
      <rect x="1" y="1" width="38" height="38" rx="10" stroke="rgba(255,248,238,0.4)" strokeWidth="1.4" />
      <path
        d="M20 8 C22.5 12.5 27 15 27 21.5 C27 26 23.9 29.5 20 29.5 C16.1 29.5 13 26 13 21.5 C13 18.2 14.8 16.4 16.3 14.8 C16.6 17.4 17.6 18.8 19 19.4 C18.6 15.2 19.2 11.4 20 8 Z"
        stroke="#e3a467"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="rgba(227,164,103,0.12)"
      />
      <path d="M12 33 H28" stroke="rgba(255,248,238,0.7)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BackLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 -ml-1 text-[12.5px] font-medium transition-colors hover:bg-white/15 ${className}`}
      style={{ color: "var(--cr-on-dark)" }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M8.5 3 L4.5 7 L8.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Todas as campanhas
    </Link>
  );
}

export default function CremacaoDashboard({
  meta,
  youtube,
  updatedAt,
  ok,
  today,
  initialTab,
}: Props) {
  const [tab, setTab] = useState<TabKey>(initialTab);
  const p = periodInfo(today);

  // Mantém a aba na URL (?aba=…) para o F5 e links diretos.
  function selectTab(k: TabKey) {
    setTab(k);
    const url = new URL(window.location.href);
    if (k === "geral") url.searchParams.delete("aba");
    else url.searchParams.set("aba", k);
    window.history.replaceState(null, "", url.toString());
  }

  const hasData = ok && (meta.length > 0 || youtube.length > 0);
  const statusText =
    p.status === "agendada"
      ? "Aguardando início"
      : p.status === "encerrada"
        ? "Campanha encerrada"
        : `Dia ${p.day} de ${p.totalDays}`;

  return (
    <main className="theme-cremacao w-full">
      <div className="cr-backdrop" aria-hidden />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-3 pb-8">
        <BackLink className="md:hidden mb-1" />

        {/* Pílulas de navegação — topo, centralizadas */}
        <nav className="sticky top-0 z-40 -mx-4 sm:mx-0 px-4 sm:px-0 py-3" aria-label="Seções do painel">
          <div className="relative flex items-center justify-center">
            <BackLink className="hidden md:inline-flex absolute left-0" />
            <div className="cr-glass cr-scroll-x inline-flex max-w-full gap-1 p-1 rounded-full" role="tablist">
              {TABS.map((t) => {
                const active = t.key === tab;
                return (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={active}
                    onClick={() => selectTab(t.key)}
                    className="px-4 sm:px-5 py-2 rounded-full text-[13.5px] font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    style={
                      active
                        ? { background: "#fff8ee", color: "#2a2520", boxShadow: "0 2px 10px rgba(40,28,16,0.28)" }
                        : { background: "transparent", color: "var(--cr-on-dark)" }
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Cabeçalho */}
        <header className="mt-3 mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3.5">
            <FlameMark />
            <div>
              <h1
                className="text-2xl sm:text-[32px] font-bold leading-[1.05] tracking-tight"
                style={{ color: "#fff", textShadow: "0 1px 3px rgba(40,28,16,0.30)" }}
              >
                Campanha Cremação
              </h1>
              <p
                className="text-[13px] sm:text-sm leading-tight mt-1 font-medium uppercase tracking-[0.14em]"
                style={{ color: "var(--cr-on-dark-muted)" }}
              >
                Cemitério Campo Santo · Meta Ads + YouTube
              </p>
            </div>
          </div>

          {/* Período */}
          <div className="cr-glass rounded-2xl px-4 py-3 min-w-0 lg:w-[320px]">
            <div className="flex items-center justify-between text-[12px]" style={{ color: "var(--cr-on-dark-muted)" }}>
              <span className="tnum">
                {dateLabel(PERIOD.start)} → {dateLabel(PERIOD.end)}/{PERIOD.end.slice(0, 4)}
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: "var(--cr-on-dark)" }}>
                {p.status === "andamento" && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#7fd1ae" }} />}
                {statusText}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,248,238,0.2)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(p.day / p.totalDays) * 100}%`,
                  background: "linear-gradient(90deg, #b07a45, #f0b47a)",
                }}
              />
            </div>
          </div>
        </header>

        {!hasData ? (
          <div className="cr-card p-8 text-center">
            <p className="text-[15px] font-medium" style={{ color: "var(--ink)" }}>
              {ok ? "A campanha ainda não registrou entrega." : "Não foi possível carregar os dados no momento."}
            </p>
            <p className="text-[13px] mt-1" style={{ color: "var(--ink-muted)" }}>
              Atualize a página em instantes.
            </p>
          </div>
        ) : (
          <div key={tab}>
            {tab === "geral" && <OverviewTab meta={meta} youtube={youtube} today={today} />}
            {tab === "meta" && <MetaTab meta={meta} today={today} />}
            {tab === "youtube" && <YoutubeTab youtube={youtube} today={today} />}
            {tab === "criativos" && <CreativesTab meta={meta} youtube={youtube} />}
          </div>
        )}

        <footer
          className="mt-8 pt-5 text-[12px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ color: "var(--cr-on-dark-muted)", borderTop: "1px solid rgba(255,248,238,0.22)" }}
        >
          <span>Largo do Campo Santo, S/N · Federação, Salvador — BA · Meta Ads: Alcance · YouTube: Visualização</span>
          {updatedAt && (
            <span className="tnum">
              Atualizado em{" "}
              {new Date(updatedAt).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Sao_Paulo",
              })}
            </span>
          )}
        </footer>
      </div>
    </main>
  );
}
