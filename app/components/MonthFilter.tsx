"use client";

import { useEffect, useRef, useState } from "react";

interface MonthFilterProps {
  currentMonth: string | null;
  previousMonths: string[]; // meses anteriores (mais recente primeiro)
  selected: string;
  onSelect: (m: string) => void;
  allValue: string; // valor que representa "todos os meses"
}

const pillBase =
  "px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap";

const activeStyle: React.CSSProperties = {
  background: "#fff",
  color: "var(--brand-deep)",
  boxShadow: "0 2px 8px rgba(40,30,10,0.22)",
};
const idleStyle: React.CSSProperties = {
  background: "transparent",
  color: "rgba(255,255,255,0.92)",
  boxShadow: "none",
};

export default function MonthFilter({
  currentMonth,
  previousMonths,
  selected,
  onSelect,
  allValue,
}: MonthFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const isAll = selected === allValue;
  const selectedPrev = previousMonths.includes(selected) ? selected : null;

  return (
    <div
      className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-full"
      style={{ background: "rgba(255,255,255,0.16)", backdropFilter: "blur(4px)" }}
      role="tablist"
      aria-label="Filtrar por mês"
    >
      {/* Mês atual — sempre visível */}
      {currentMonth && (
        <button
          className={pillBase}
          style={selected === currentMonth ? activeStyle : idleStyle}
          onClick={() => onSelect(currentMonth)}
          aria-selected={selected === currentMonth}
          role="tab"
        >
          {currentMonth}
          <span
            className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
            style={{
              background: selected === currentMonth ? "var(--status-good)" : "#fff",
            }}
            title="Mês atual"
          />
        </button>
      )}

      {/* Mês anterior selecionado — "sai pra fora" ao lado do atual */}
      {selectedPrev && (
        <button className={pillBase} style={activeStyle} aria-selected role="tab">
          {selectedPrev}
        </button>
      )}

      {/* Dropdown "Meses anteriores" */}
      {previousMonths.length > 0 && (
        <div className="relative" ref={ref}>
          <button
            className={pillBase + " inline-flex items-center gap-1"}
            style={open ? activeStyle : idleStyle}
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            Meses anteriores
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="transition-transform"
              style={{ transform: open ? "rotate(180deg)" : "none" }}
              aria-hidden
            >
              <path
                d="M3 4.5 L6 7.5 L9 4.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {open && (
            <div
              className="absolute right-0 mt-2 z-30 min-w-[160px] rounded-2xl p-1.5 bg-white"
              style={{
                boxShadow: "0 18px 44px -12px rgba(40,30,10,0.45)",
                border: "1px solid var(--hairline)",
              }}
              role="listbox"
            >
              {previousMonths.map((m) => {
                const on = m === selected;
                return (
                  <button
                    key={m}
                    role="option"
                    aria-selected={on}
                    onClick={() => {
                      onSelect(m);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[13px] flex items-center justify-between gap-3 transition-colors hover:bg-[rgba(138,109,53,0.08)]"
                    style={{
                      background: on ? "rgba(138,109,53,0.14)" : "transparent",
                      color: "var(--ink)",
                      fontWeight: on ? 600 : 500,
                    }}
                  >
                    {m}
                    {on && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path
                          d="M2.5 7.5 L5.5 10.5 L11.5 3.5"
                          stroke="var(--brand)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Todos os meses */}
      <button
        className={pillBase}
        style={isAll ? activeStyle : idleStyle}
        onClick={() => onSelect(allValue)}
        aria-selected={isAll}
        role="tab"
      >
        Todos os meses
      </button>
    </div>
  );
}
