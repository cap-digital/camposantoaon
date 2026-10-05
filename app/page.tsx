import Link from "next/link";
import { Suspense } from "react";
import { Monogram } from "@/app/components/Dashboard";
import SearchTyper from "@/app/components/landing/SearchTyper";
import { AonLive, CremacaoLive, LiveSkeleton } from "@/app/components/landing/LiveStats";
import { PERIOD } from "@/lib/cremacao/types";
import { fetchCampaignData, keepPreviousOnFailure } from "@/lib/data";
import { fetchCremacaoData } from "@/lib/cremacao/data";
import { dateLabel, periodInfo, todayBR } from "@/lib/cremacao/metrics";

// Página inicial: portal das campanhas. ISR (ver app/aon/page.tsx): servida
// pronta e regenerada a cada 5 min, junto com o título e o "dia X de Y".
export const revalidate = 300;

// Brasas determinísticas (mesmo resultado no servidor e no cliente).
const EMBERS = Array.from({ length: 30 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    left: `${(r(1) * 100).toFixed(1)}%`,
    size: 4 + r(2) * 8,
    duration: 7 + r(3) * 9,
    delay: -r(4) * 16,
    dx: `${((r(5) - 0.5) * 90).toFixed(0)}px`,
    o: (0.5 + r(6) * 0.5).toFixed(2),
  };
});

const COUNT_WORD: Record<number, string> = { 2: "Duas", 3: "Três", 4: "Quatro" };

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8 H13 M9 4 L13 8 L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function Home() {
  // Uma leitura só (compartilhada com os blocos de números abaixo).
  const [aon, cr] = await Promise.all([fetchCampaignData(), fetchCremacaoData()]);
  keepPreviousOnFailure(aon.ok && cr.ok);

  const p = periodInfo(todayBR());
  // Campanhas ativas hoje: a AON é contínua (sem data de fim); a Cremação só
  // conta dentro do período contratado. O título se ajusta sozinho.
  const activeCount = 1 + (p.status === "andamento" ? 1 : 0);
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);
  const ringC = 2 * Math.PI * 22;

  return (
    <main className="min-h-screen w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Topo */}
        <header className="cs-rise flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Monogram />
            <div>
              <div
                className="text-white text-xl sm:text-2xl font-bold leading-[1.05] tracking-tight"
                style={{ textShadow: "0 1px 3px rgba(52,38,12,0.30)" }}
              >
                Cemitério Campo Santo
              </div>
              <div
                className="text-[12px] sm:text-[13px] leading-tight mt-1 font-medium uppercase tracking-[0.14em]"
                style={{ color: "rgba(255,255,255,0.82)" }}
              >
                Painéis de campanha
              </div>
            </div>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium"
            style={{ background: "rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)" }}
          >
            <span className="ld-live h-2 w-2 rounded-full" style={{ background: "#7fd1ae" }} />
            <span>{todayCap}</span>
          </div>
        </header>

        <div className="cs-rise mt-10 sm:mt-14 mb-6 sm:mb-8" style={{ animationDelay: "60ms" }}>
          <h1
            className="text-white text-[34px] sm:text-[52px] font-bold leading-[1.02] tracking-tight text-balance"
            style={{ textShadow: "0 2px 12px rgba(52,38,12,0.25)" }}
          >
            {activeCount === 1 ? "Uma campanha no ar." : `${COUNT_WORD[activeCount] ?? activeCount} campanhas no ar.`}
          </h1>
          <p className="mt-3 text-[15px] sm:text-[17px] max-w-2xl" style={{ color: "rgba(255,255,255,0.86)" }}>
            Escolha um painel para acompanhar investimento, entrega e metas contratadas — os
            números abaixo já são de hoje.
          </p>
        </div>

        <div className="ld-split lg:min-h-[580px]">
          {/* ---------- AON ---------- */}
          <Link
            href="/aon"
            className="ld-panel cs-rise group flex flex-col p-6 sm:p-9"
            style={{
              animationDelay: "120ms",
              color: "var(--ink)",
              background:
                "radial-gradient(90% 70% at 0% 0%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 60%), linear-gradient(150deg, #f7f0de 0%, #ecdfbf 50%, #dcc797 100%)",
              boxShadow: "0 30px 60px -30px rgba(52,38,12,0.65), inset 0 0 0 1px rgba(255,255,255,0.5)",
            }}
          >
            <span className="ld-sheen" aria-hidden />
            {/* marca d'água */}
            <span
              className="absolute -right-4 -top-10 text-[200px] font-black leading-none tracking-tighter select-none pointer-events-none"
              style={{ color: "rgba(138,109,53,0.07)" }}
              aria-hidden
            >
              AON
            </span>

            <div className="flex items-center justify-between gap-3 text-[12px] font-medium">
              <span className="uppercase tracking-[0.14em]" style={{ color: "var(--brand)" }}>
                01 · Google Pesquisa
              </span>
              <span className="inline-flex items-center gap-1.5" style={{ color: "var(--ink-2)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--status-good)" }} />
                Contínua · mensal
              </span>
            </div>

            <h2 className="mt-6 text-[56px] sm:text-[84px] font-black leading-[0.9] tracking-tighter" style={{ color: "#3b2f17" }}>
              AON
            </h2>
            <p className="mt-2 text-[14px] sm:text-[15px] max-w-sm" style={{ color: "var(--ink-2)" }}>
              Quem procura, encontra o Campo Santo: busca institucional, cremação, velórios online e capela.
            </p>

            <div className="mt-7">
              <SearchTyper />
            </div>

            <div className="mt-auto pt-8 relative">
              <Suspense fallback={<LiveSkeleton tone="light" />}>
                <AonLive />
              </Suspense>
              <span
                className="ld-cta mt-7 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold"
                style={{ background: "#3b2f17", color: "#f7f0de" }}
              >
                Entrar no painel <Arrow />
              </span>
            </div>
          </Link>

          {/* ---------- Cremação ---------- */}
          <Link
            href="/cremacao"
            className="ld-panel cs-rise group flex flex-col p-6 sm:p-9"
            style={{
              animationDelay: "200ms",
              color: "rgba(255,248,238,0.95)",
              background:
                "radial-gradient(70% 60% at 85% 110%, rgba(227,147,79,0.45) 0%, rgba(227,147,79,0) 60%), radial-gradient(60% 50% at 0% 0%, rgba(149,133,73,0.25) 0%, rgba(149,133,73,0) 60%), linear-gradient(165deg, #342e29 0%, #221e1b 55%, #171513 100%)",
              boxShadow: "0 30px 60px -28px rgba(20,12,4,0.85), inset 0 0 0 1px rgba(255,248,238,0.08)",
            }}
          >
            {/* brasas */}
            <span className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
              {EMBERS.map((e, i) => (
                <span
                  key={i}
                  className="ld-ember"
                  style={{
                    left: e.left,
                    width: e.size,
                    height: e.size,
                    animationDuration: `${e.duration}s`,
                    animationDelay: `${e.delay}s`,
                    ["--dx" as string]: e.dx,
                    ["--o" as string]: e.o,
                  }}
                />
              ))}
            </span>

            <div className="flex items-center justify-between gap-3 text-[12px] font-medium">
              <span className="uppercase tracking-[0.14em]" style={{ color: "#f2c08f" }}>
                02 · Meta Ads + YouTube
              </span>
              <span className="inline-flex items-center gap-1.5" style={{ opacity: 0.8 }}>
                {dateLabel(PERIOD.start)} → {dateLabel(PERIOD.end)}
              </span>
            </div>

            <h2 className="mt-6 text-[56px] sm:text-[84px] font-black leading-[0.9] tracking-tighter" style={{ color: "#fff4e4" }}>
              Cremação
            </h2>
            <p className="mt-2 text-[14px] sm:text-[15px] max-w-sm" style={{ opacity: 0.78 }}>
              Respeito e cuidado em cada detalhe: alcance no Meta Ads e visualizações no YouTube.
            </p>

            {/* anel do período */}
            <div className="mt-7 inline-flex items-center gap-3.5">
              <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,248,238,0.14)" strokeWidth="5" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="#e3a467"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.max(0.01, (p.day / p.totalDays) * ringC)} ${ringC}`}
                  transform="rotate(-90 28 28)"
                />
              </svg>
              <div>
                <div className="text-[20px] font-bold leading-none">
                  {p.status === "agendada" ? "Em breve" : p.status === "encerrada" ? "Encerrada" : `Dia ${p.day}`}
                  <span className="text-[13px] font-medium opacity-60"> de {p.totalDays}</span>
                </div>
                <div className="text-[12px] opacity-65 mt-1">
                  {p.status === "andamento" ? `${p.totalDays - p.day} dias até o fim da campanha` : "Período da campanha"}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <Suspense fallback={<LiveSkeleton tone="dark" />}>
                <CremacaoLive />
              </Suspense>
              <span
                className="ld-cta mt-7 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold"
                style={{ background: "#e3a467", color: "#231c15" }}
              >
                Entrar no painel <Arrow />
              </span>
            </div>
          </Link>
        </div>

        <footer className="mt-6 text-[12px]" style={{ color: "rgba(255,255,255,0.72)" }}>
          Largo do Campo Santo, S/N · Federação, Salvador — BA
        </footer>
      </div>
    </main>
  );
}
