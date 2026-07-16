"use client";

import { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: string;
  sub?: ReactNode;
  accent?: string; // cor do marcador de identidade
  delay?: number;
}

export default function StatTile({
  label,
  value,
  sub,
  accent = "var(--brand)",
  delay = 0,
}: StatTileProps) {
  return (
    <div
      className="cs-card cs-hover cs-rise p-4 sm:p-5 flex flex-col gap-1.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
          style={{ background: accent }}
          aria-hidden
        />
        <span
          className="text-[12px] sm:text-[13px] font-medium leading-tight"
          style={{ color: "var(--ink-2)" }}
        >
          {label}
        </span>
      </div>
      <div
        className="text-2xl sm:text-[28px] font-semibold leading-none mt-0.5"
        style={{ color: "var(--ink)" }}
      >
        {value}
      </div>
      {sub && (
        <div
          className="text-[12px] leading-tight mt-0.5"
          style={{ color: "var(--ink-muted)" }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
