"use client";

/* eslint-disable @next/next/no-img-element -- miniaturas externas (fbcdn / ytimg) com URLs assinadas */

import { useEffect, useState } from "react";
import { PLATFORM_INFO } from "@/lib/cremacao/types";
import { Creative, dateLabel, shortAdName } from "@/lib/cremacao/metrics";
import { fmtBRL, fmtNum, fmtPct } from "@/lib/metrics";

function instagramEmbed(permalink: string): string {
  return permalink.replace(/\/?(\?.*)?$/, "/") + "embed/captioned/";
}

export default function CreativeModal({
  creative: c,
  onClose,
}: {
  creative: Creative;
  onClose: () => void;
}) {
  const [view, setView] = useState<"peca" | "post">("peca");
  const [imgError, setImgError] = useState(false);
  const info = PLATFORM_INFO[c.platform];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const stats =
    c.platform === "meta"
      ? [
          ["Investimento", fmtBRL(c.investimento, 2)],
          ["Impressões", fmtNum(c.impressoes)],
          ["CPM", fmtBRL(c.cpm, 2)],
          ["Cliques", fmtNum(c.cliques)],
          ["CTR", fmtPct(c.ctr, 2)],
          ["Engajamentos", fmtNum(c.engajamento)],
        ]
      : [
          ["Investimento", fmtBRL(c.investimento, 2)],
          ["Visualizações", fmtNum(c.visualizacoes)],
          ["CPV", c.visualizacoes > 0 ? fmtBRL(c.investimento / c.visualizacoes, 2) : "—"],
          ["Impressões", fmtNum(c.impressoes)],
          ["Taxa de visualização", fmtPct(c.impressoes > 0 ? (c.visualizacoes / c.impressoes) * 100 : 0)],
          ["CTR", fmtPct(c.ctr, 2)],
        ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(18,16,14,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview de ${c.name}`}
    >
      <div
        className="cr-card cs-rise w-full max-w-4xl max-h-[92vh] overflow-y-auto grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview */}
        <div
          className="p-3 sm:p-4 flex flex-col gap-3 rounded-t-[18px] md:rounded-tr-none md:rounded-l-[18px]"
          style={{ background: "#1f1c19" }}
        >
          {c.platform === "meta" && c.permalink && (
            <div className="inline-flex self-start rounded-full p-0.5" style={{ background: "rgba(255,248,238,0.1)" }}>
              {(["peca", "post"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setView(k)}
                  className="px-3 py-1 rounded-full text-[12px] font-medium"
                  style={
                    view === k
                      ? { background: "#fff8ee", color: "#2a2520" }
                      : { color: "rgba(255,248,238,0.85)" }
                  }
                >
                  {k === "peca" ? "Peça" : "Post no Instagram"}
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 flex items-center justify-center min-h-[320px]">
            {c.platform === "youtube" && c.videoId ? (
              <div className="w-full aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${c.videoId}?rel=0`}
                  title={c.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : view === "post" && c.permalink ? (
              <iframe
                src={instagramEmbed(c.permalink)}
                title={`Post no Instagram — ${c.name}`}
                className="w-full max-w-[400px] h-[68vh] rounded-xl bg-white"
                loading="lazy"
              />
            ) : c.thumbnail && !imgError ? (
              <img
                src={c.thumbnail}
                alt={c.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain"
              />
            ) : (
              <p className="text-[13px] text-center px-6" style={{ color: "rgba(255,248,238,0.7)" }}>
                Miniatura indisponível no momento — o link da imagem do Meta expira e é
                renovado na próxima atualização da planilha.
              </p>
            )}
          </div>
        </div>

        {/* Dados */}
        <div className="p-5 sm:p-6 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <span
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full"
              style={{ background: info.soft, color: "var(--ink)" }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: info.color }} />
              {info.label}
            </span>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/5"
              aria-label="Fechar"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M3 3 L11 11 M11 3 L3 11" stroke="var(--ink-2)" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <h3 className="text-[18px] font-semibold mt-3 leading-snug" style={{ color: "var(--ink)" }}>
            {shortAdName(c.name)}
          </h3>
          <p className="text-[12px] mt-1 break-words" style={{ color: "var(--ink-muted)" }}>
            {c.name} · no ar de {dateLabel(c.firstDate)} a {dateLabel(c.lastDate)}
          </p>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 mt-5">
            {stats.map(([k, v]) => (
              <div key={k} className="rounded-xl px-3 py-2.5" style={{ background: "rgba(33,29,20,0.04)" }}>
                <dt className="text-[11.5px]" style={{ color: "var(--ink-muted)" }}>{k}</dt>
                <dd className="text-[16px] font-semibold mt-0.5" style={{ color: "var(--ink)" }}>{v}</dd>
              </div>
            ))}
          </dl>

          {c.permalink && (
            <a
              href={c.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto pt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold"
              style={{ color: "var(--cr-yt)" }}
            >
              Abrir no {c.platform === "meta" ? "Instagram" : "YouTube"}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M4 2 H10 V8 M10 2 L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
