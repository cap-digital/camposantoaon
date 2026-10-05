"use client";

import { useEffect, useState } from "react";

// Barra de busca que "digita" sozinha as buscas que a campanha AON cobre.
const QUERIES = [
  "cemitério em salvador",
  "cremação salvador preço",
  "velório online campo santo",
  "capela para velório salvador",
  "cemitério campo santo whatsapp",
];

export default function SearchTyper() {
  const [qi, setQi] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"type" | "hold" | "erase">("type");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(QUERIES[0]);
      return;
    }
    const q = QUERIES[qi];
    let t: ReturnType<typeof setTimeout>;
    if (phase === "type") {
      if (text.length < q.length) t = setTimeout(() => setText(q.slice(0, text.length + 1)), 55 + Math.random() * 60);
      else t = setTimeout(() => setPhase("hold"), 50);
    } else if (phase === "hold") {
      t = setTimeout(() => setPhase("erase"), 1900);
    } else {
      if (text.length > 0) t = setTimeout(() => setText(text.slice(0, -1)), 22);
      else {
        setQi((qi + 1) % QUERIES.length);
        setPhase("type");
      }
    }
    return () => clearTimeout(t);
  }, [text, phase, qi]);

  const showResult = phase === "hold";

  return (
    <div className="w-full max-w-[460px]">
      <div
        className="flex items-center gap-3 rounded-full bg-white px-4 py-3"
        style={{ boxShadow: "0 10px 30px -12px rgba(60,44,12,0.55), 0 1px 2px rgba(60,44,12,0.15)" }}
      >
        <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="7.5" cy="7.5" r="5.5" stroke="#9a8b6c" strokeWidth="1.8" />
          <path d="M12 12 L16 16" stroke="#9a8b6c" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className="flex-1 text-[15px] truncate" style={{ color: "var(--ink)" }} aria-live="off">
          {text}
          <span className="ld-caret inline-block w-[1.5px] h-[17px] align-[-3px] ml-[1px]" style={{ background: "var(--brand)" }} />
        </span>
      </div>

      {/* "resultado" patrocinado que aparece quando a busca termina */}
      <div
        className="mt-3 rounded-2xl px-4 py-3 transition-all duration-500"
        style={{
          background: "rgba(255,252,244,0.92)",
          opacity: showResult ? 1 : 0,
          transform: showResult ? "translateY(0)" : "translateY(-6px)",
          boxShadow: "0 10px 30px -16px rgba(60,44,12,0.5)",
        }}
        aria-hidden
      >
        <div className="flex items-center gap-2 text-[11.5px]" style={{ color: "var(--ink-2)" }}>
          <span className="font-semibold" style={{ color: "var(--ink)" }}>Patrocinado</span>
          <span>·</span>
          <span className="truncate">Cemitério Campo Santo</span>
        </div>
        <div className="text-[15px] font-medium mt-0.5 truncate" style={{ color: "#1a4fa0" }}>
          Cemitério Campo Santo | Tradição e Modernidade
        </div>
      </div>
    </div>
  );
}
