"use client";

/* eslint-disable @next/next/no-img-element -- miniaturas externas (fbcdn / ytimg) com URLs assinadas */

import { useMemo, useState } from "react";
import { MetaRow, PLATFORM_INFO, Platform, YtRow } from "@/lib/cremacao/types";
import { Creative, creatives, shortAdName } from "@/lib/cremacao/metrics";
import { fmtBRL, fmtNum, fmtPct } from "@/lib/metrics";
import CreativeScatter from "./CreativeScatter";
import CreativeModal from "./CreativeModal";
import { EmptyNote, Segmented } from "./ui";

type Scope = "todos" | Platform;

function Thumb({ c }: { c: Creative }) {
  const [err, setErr] = useState(false);
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-t-[18px]" style={{ background: "#2a2622" }}>
      {c.thumbnail && !err ? (
        <img
          src={c.thumbnail}
          alt=""
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setErr(true)}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-[12px]" style={{ color: "rgba(255,248,238,0.6)" }}>
          Miniatura indisponível
        </div>
      )}
      <span
        className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full"
        style={{ background: "rgba(255,253,249,0.92)", color: "var(--ink)" }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: PLATFORM_INFO[c.platform].color }} />
        {PLATFORM_INFO[c.platform].label}
      </span>
      {c.platform === "youtube" && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="h-12 w-12 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M6 4 L14 9 L6 14 Z" fill="#fff" /></svg>
          </span>
        </span>
      )}
      <span
        className="absolute bottom-3 right-3 text-[11.5px] font-medium px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "rgba(18,16,14,0.75)", color: "#fff8ee" }}
      >
        Ver preview
      </span>
    </div>
  );
}

export default function CreativesTab({ meta, youtube }: { meta: MetaRow[]; youtube: YtRow[] }) {
  const [scope, setScope] = useState<Scope>("todos");
  const [open, setOpen] = useState<Creative | null>(null);
  const all = useMemo(() => creatives(meta, youtube), [meta, youtube]);
  const items = scope === "todos" ? all : all.filter((c) => c.platform === scope);
  const count = (p: Platform) => all.filter((c) => c.platform === p).length;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="cr-card px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px]" style={{ color: "var(--ink-2)" }}>
          <span className="font-semibold" style={{ color: "var(--ink)" }}>{items.length}</span>{" "}
          {items.length === 1 ? "criativo" : "criativos"} em veiculação · clique numa peça para ver o preview
        </p>
        <Segmented
          label="Filtrar criativos por canal"
          value={scope}
          onChange={setScope}
          options={[
            { key: "todos", label: `Todos (${all.length})` },
            { key: "meta", label: `Meta Ads (${count("meta")})`, dot: PLATFORM_INFO.meta.color },
            { key: "youtube", label: `YouTube (${count("youtube")})`, dot: PLATFORM_INFO.youtube.color },
          ]}
        />
      </div>

      {items.length === 0 ? (
        <div className="cr-card p-6">
          <EmptyNote>
            {scope === "youtube"
              ? "Os vídeos do YouTube aparecem aqui assim que a campanha começar a entregar."
              : "Nenhum criativo com entrega neste filtro."}
          </EmptyNote>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {items.map((c, i) => (
              <button
                key={c.key}
                onClick={() => setOpen(c)}
                className="cr-card cr-hover cs-rise group text-left flex flex-col"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Thumb c={c} />
                <div className="p-4">
                  <div className="text-[14px] font-semibold truncate" style={{ color: "var(--ink)" }} title={c.name}>
                    {shortAdName(c.name)}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {(c.platform === "meta"
                      ? [
                          ["Invest.", fmtBRL(c.investimento)],
                          ["Impr.", fmtNum(c.impressoes)],
                          ["CTR", fmtPct(c.ctr, 2)],
                        ]
                      : [
                          ["Invest.", fmtBRL(c.investimento)],
                          ["Views", fmtNum(c.visualizacoes)],
                          ["CPV", c.visualizacoes > 0 ? fmtBRL(c.investimento / c.visualizacoes, 2) : "—"],
                        ]
                    ).map(([k, v]) => (
                      <div key={k}>
                        <div className="text-[11px]" style={{ color: "var(--ink-muted)" }}>{k}</div>
                        <div className="text-[13.5px] font-semibold tnum" style={{ color: "var(--ink)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <CreativeScatter items={items} onOpen={setOpen} />
        </>
      )}

      {open && <CreativeModal creative={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
