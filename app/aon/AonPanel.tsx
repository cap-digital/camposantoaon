"use client";

import Dashboard from "@/app/components/Dashboard";
import { useFallbackData } from "@/app/components/useFallbackData";
import { KeywordRow, RawRow } from "@/lib/types";

interface AonData {
  google: RawRow[];
  google2: RawRow[];
  keywords: KeywordRow[];
  currentMonth: string | null;
  updatedAt: string | null;
  ok: boolean;
}

// Invólucro do painel AON: se a página estática saiu sem dados, busca no
// navegador (/api/aon) antes de mostrar o painel. O painel em si não muda.
export default function AonPanel(initial: AonData) {
  const { data, loading } = useFallbackData(initial, "/api/aon");

  if (loading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="cs-card p-8 text-center max-w-sm w-full" role="status">
          <div
            className="mx-auto h-7 w-7 rounded-full border-[3px] animate-spin"
            style={{ borderColor: "rgba(138,109,53,0.15)", borderTopColor: "var(--brand)" }}
            aria-hidden
          />
          <p className="text-[15px] font-medium mt-3" style={{ color: "var(--ink)" }}>
            Carregando os dados da planilha…
          </p>
          <p className="text-[13px] mt-1" style={{ color: "var(--ink-muted)" }}>
            Isso leva alguns segundos.
          </p>
        </div>
      </main>
    );
  }

  return <Dashboard {...data} />;
}
