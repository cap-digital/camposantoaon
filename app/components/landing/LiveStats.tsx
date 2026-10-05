import { fetchCampaignData } from "@/lib/data";
import { computeDaily, computeTotals } from "@/lib/metrics";
import { GOAL_CLIQUES, GOAL_INVESTIMENTO } from "@/lib/types";
import { fetchCremacaoData } from "@/lib/cremacao/data";
import { sumMeta, sumYt } from "@/lib/cremacao/metrics";
import { GOALS } from "@/lib/cremacao/types";
import CountUp from "./CountUp";

// Números ao vivo dos dois painéis. São componentes assíncronos do servidor,
// renderizados dentro de <Suspense>: a página abre na hora e os números
// chegam por streaming quando o endpoint responde.

function Spark({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const w = 220;
  const h = 44;
  const max = Math.max(1, ...values);
  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${((i / (values.length - 1)) * w).toFixed(1)} ${(h - 3 - (v / max) * (h - 8)).toFixed(1)}`)
    .join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden className="overflow-visible">
      <path
        d={d}
        pathLength={1}
        className="ld-draw"
        style={{ ["--len" as string]: 1 }}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Bar({ pct, fill, track }: { pct: number; fill: string; track: string }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: track }}>
      <div
        className="h-full rounded-full transition-[width] duration-1000"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: fill }}
      />
    </div>
  );
}

export async function AonLive() {
  const { google, google2, currentMonth, ok } = await fetchCampaignData();
  if (!ok || google.length + google2.length === 0) {
    return <p className="text-[13px] opacity-70">Números indisponíveis no momento.</p>;
  }
  const month = google.length > 0 ? google : google2;
  const t = computeTotals(month);
  const spark = computeDaily([...google, ...google2]).slice(-30).map((d) => d.cliques);

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3 items-end">
      <div className="min-w-0">
        <div className="text-[11.5px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--brand)" }}>
          {currentMonth ?? "Mês atual"} até agora
        </div>
        <div className="text-[30px] sm:text-[34px] font-bold leading-none mt-2 tracking-tight">
          <CountUp value={t.cliques} format="int" />
          <span className="text-[14px] font-medium ml-1.5" style={{ color: "var(--ink-2)" }}>cliques</span>
        </div>
        <div className="mt-2.5">
          <Bar pct={(t.cliques / GOAL_CLIQUES) * 100} fill="linear-gradient(90deg,#6f5a30,#b8974f)" track="rgba(111,90,48,0.15)" />
        </div>
        <div className="text-[12px] mt-1.5 tnum" style={{ color: "var(--ink-2)" }}>
          <CountUp value={t.investimento} format="brl" /> de {GOAL_INVESTIMENTO.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-[11px] mb-1" style={{ color: "var(--ink-2)" }}>Cliques · últimos 30 dias</div>
        <Spark values={spark} color="var(--brand)" />
      </div>
    </div>
  );
}

export async function CremacaoLive() {
  const { meta, youtube, ok } = await fetchCremacaoData();
  if (!ok) return <p className="text-[13px] opacity-70">Números indisponíveis no momento.</p>;
  const m = sumMeta(meta);
  const y = sumYt(youtube);
  const goalInvest = GOALS.meta.investimento + GOALS.youtube.investimento;
  const invest = m.investimento + y.investimento;

  const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const stats = [
    {
      label: "Investido",
      value: <CountUp value={invest} format="brl" />,
      pct: (invest / goalInvest) * 100,
      sub: `de ${brl(goalInvest)}`,
    },
    {
      label: "Impressões · Meta",
      value: <CountUp value={m.impressoes} format="int" />,
      pct: (m.impressoes / GOALS.meta.impressoes) * 100,
      sub: `de ${GOALS.meta.impressoes.toLocaleString("pt-BR")}`,
    },
    {
      label: "Views · YouTube",
      value: <CountUp value={y.visualizacoes} format="int" />,
      pct: (y.visualizacoes / GOALS.youtube.visualizacoes) * 100,
      sub: `de ${GOALS.youtube.visualizacoes.toLocaleString("pt-BR")}`,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-x-4 sm:gap-x-6 max-w-[560px]">
      {stats.map((st) => (
        <div key={st.label} className="min-w-0">
          <div
            className="text-[10.5px] sm:text-[11.5px] uppercase tracking-[0.1em] font-semibold leading-tight min-h-[2.5em] sm:min-h-0 sm:truncate"
            style={{ color: "#f2c08f" }}
          >
            {st.label}
          </div>
          <div className="text-[22px] sm:text-[30px] font-bold leading-none mt-2 tracking-tight truncate">
            {st.value}
          </div>
          <div className="mt-2.5">
            <Bar pct={st.pct} fill="linear-gradient(90deg,#b07a45,#e3a467)" track="rgba(255,248,238,0.12)" />
          </div>
          <div className="text-[11.5px] sm:text-[12px] mt-1.5 opacity-70 tnum truncate">{st.sub}</div>
        </div>
      ))}
    </div>
  );
}

export function LiveSkeleton({ tone }: { tone: "light" | "dark" }) {
  const bg =
    tone === "light"
      ? "linear-gradient(90deg, rgba(111,90,48,0.10), rgba(111,90,48,0.22), rgba(111,90,48,0.10))"
      : undefined;
  const cols = tone === "dark" ? 3 : 2;
  return (
    <div className={`grid ${cols === 3 ? "grid-cols-3 max-w-[560px]" : "grid-cols-2 max-w-[460px]"} gap-6`}>
      {Array.from({ length: cols }, (_, i) => i).map((i) => (
        <div key={i} className="flex flex-col gap-2.5">
          <div className="ld-skel h-3 w-24" style={{ backgroundImage: bg }} />
          <div className="ld-skel h-8 w-32" style={{ backgroundImage: bg }} />
          <div className="ld-skel h-1.5 w-full" style={{ backgroundImage: bg }} />
        </div>
      ))}
    </div>
  );
}
