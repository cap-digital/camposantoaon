"use client";

import { Creative } from "@/lib/cremacao/metrics";
import { fmtBRL, fmtNum, fmtPct } from "@/lib/metrics";
import { Card, CardHead, HoverTip } from "./ui";

// Ranking dos vídeos por visualizações: barra horizontal + CPV e taxa ao lado.
export default function VideoRanking({ videos }: { videos: Creative[] }) {
  const sorted = [...videos].sort((a, b) => b.visualizacoes - a.visualizacoes);
  const max = Math.max(1, ...sorted.map((v) => v.visualizacoes));

  return (
    <Card delay={120} className="h-full">
      <CardHead title="Vídeos por visualizações" sub="CPV e taxa de visualização de cada peça" />
      <ul className="flex flex-col gap-3">
        {sorted.map((v) => {
          const cpv = v.visualizacoes > 0 ? v.investimento / v.visualizacoes : 0;
          const vtr = v.impressoes > 0 ? (v.visualizacoes / v.impressoes) * 100 : 0;
          return (
            <li key={v.key} className="min-w-0">
              <HoverTip
                title={v.name}
                rows={[
                  { label: "Visualizações", value: fmtNum(v.visualizacoes), color: "var(--cr-yt)" },
                  { label: "Impressões", value: fmtNum(v.impressoes) },
                  { label: "Taxa de visualização", value: fmtPct(vtr) },
                  { label: "CPV", value: v.visualizacoes > 0 ? fmtBRL(cpv, 2) : "—" },
                  { label: "Investimento", value: fmtBRL(v.investimento, 2) },
                ]}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[12.5px] truncate" style={{ color: "var(--ink-2)" }}>
                    {v.name}
                  </span>
                  <span className="text-[13px] font-semibold tnum shrink-0" style={{ color: "var(--ink)" }}>
                    {fmtNum(v.visualizacoes)}
                  </span>
                </div>
                <div className="mt-1 h-3 rounded-r-[4px] overflow-hidden" style={{ background: "rgba(33,29,20,0.05)" }}>
                  <div
                    className="h-full rounded-r-[4px]"
                    style={{ width: `${(v.visualizacoes / max) * 100}%`, background: "var(--cr-yt)", transition: "width 0.6s" }}
                  />
                </div>
                <div className="mt-1 flex gap-3 text-[11.5px] tnum" style={{ color: "var(--ink-muted)" }}>
                  <span>CPV {v.visualizacoes > 0 ? fmtBRL(cpv, 2) : "—"}</span>
                  <span>Taxa {fmtPct(vtr)}</span>
                  <span>{fmtBRL(v.investimento)}</span>
                </div>
              </HoverTip>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
