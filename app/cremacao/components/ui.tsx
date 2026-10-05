"use client";

import { ReactNode, useLayoutEffect, useRef, useState } from "react";

// Peças de interface da Cremação: cartão, título, seletor segmentado, KPI,
// legenda e a linha de leitura do hover (abaixo do gráfico, estável no mobile).

export function Card({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section
      className={`cr-card cr-hover cs-rise p-5 sm:p-6 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

export function CardHead({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
          {title}
        </h2>
        {sub && (
          <p className="text-[12.5px]" style={{ color: "var(--ink-muted)" }}>
            {sub}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

export function Segmented<K extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { key: K; label: string; dot?: string }[];
  value: K;
  onChange: (k: K) => void;
  label: string;
}) {
  return (
    <div
      className="inline-flex rounded-full p-0.5"
      style={{ background: "rgba(33,29,20,0.06)" }}
      role="tablist"
      aria-label={label}
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.key)}
            className="px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-colors inline-flex items-center gap-1.5"
            style={{
              background: active ? "#fff" : "transparent",
              color: active ? "var(--ink)" : "var(--ink-2)",
              boxShadow: active ? "0 1px 3px rgba(33,29,20,0.16)" : "none",
            }}
          >
            {o.dot && (
              <span className="h-2 w-2 rounded-full" style={{ background: o.dot }} aria-hidden />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Kpi({
  label,
  value,
  sub,
  accent,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  accent: string;
  delay?: number;
}) {
  return (
    <div
      className="cr-card cr-hover cs-rise p-4 sm:p-5 flex flex-col gap-1.5 min-w-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2">
        <span className="h-1 w-4 rounded-full shrink-0" style={{ background: accent }} aria-hidden />
        <span className="text-[12px] sm:text-[13px] font-medium leading-tight truncate" style={{ color: "var(--ink-2)" }}>
          {label}
        </span>
      </div>
      <div className="text-[22px] sm:text-[26px] font-semibold leading-none mt-1" style={{ color: "var(--ink)" }}>
        {value}
      </div>
      {sub && (
        <div className="text-[12px] leading-tight mt-0.5" style={{ color: "var(--ink-muted)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function Legend({
  items,
}: {
  items: { label: string; color: string; kind?: "dot" | "line" | "dash" }[];
}) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px]" style={{ color: "var(--ink-2)" }}>
      {items.map((i) => (
        <li key={i.label} className="inline-flex items-center gap-1.5">
          {i.kind === "line" ? (
            <span className="h-[2px] w-4 rounded-full" style={{ background: i.color }} aria-hidden />
          ) : i.kind === "dash" ? (
            <span className="w-4 border-t-2 border-dotted" style={{ borderColor: i.color }} aria-hidden />
          ) : (
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: i.color }} aria-hidden />
          )}
          {i.label}
        </li>
      ))}
    </ul>
  );
}

export interface TipRow {
  label: string;
  value: string;
  color?: string;
}

// Tooltip flutuante ao lado da marca em foco. Abre para a direita na metade
// esquerda do gráfico e para a esquerda na metade direita, para nunca sair
// do cartão nem cobrir o ponto.
export function ChartTooltip({
  x,
  y,
  width,
  title,
  rows,
  side,
}: {
  x: number;
  y: number;
  width: number;
  title: string;
  rows: TipRow[];
  side?: "left" | "right"; // força o lado; padrão: oposto à metade do gráfico
}) {
  const toLeft = side ? side === "left" : x > width * 0.55;
  // Depois de medir, desloca o tooltip para dentro da tela se ainda sobrar
  // (ex.: elementos estreitos no celular).
  const ref = useRef<HTMLDivElement>(null);
  const [dx, setDx] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = r.left - dx;
    const right = r.right - dx;
    const vw = window.innerWidth;
    let shift = 0;
    if (right > vw - 8) shift = vw - 8 - right;
    if (left + shift < 8) shift = 8 - left;
    if (shift !== dx) setDx(shift);
    // `rows` muda a largura do tooltip; reavalia a cada conteúdo/posição.
  }, [x, y, width, toLeft, dx, rows]);
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute z-20 rounded-xl px-3 py-2 text-[12px] whitespace-nowrap"
      style={{
        top: y,
        left: toLeft ? undefined : x + 14,
        right: toLeft ? width - x + 14 : undefined,
        transform: `translate(${dx}px, -50%)`,
        background: "rgba(33,29,20,0.94)",
        color: "#fff8ee",
        boxShadow: "0 10px 24px -10px rgba(0,0,0,0.5)",
      }}
      role="tooltip"
    >
      <div className="text-[11px] mb-1" style={{ color: "rgba(255,248,238,0.65)" }}>
        {title}
      </div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2 leading-[1.6]">
          {r.color && (
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: r.color, boxShadow: "0 0 0 1.5px rgba(255,248,238,0.8)" }}
            />
          )}
          <span style={{ color: "rgba(255,248,238,0.75)" }}>{r.label}</span>
          <span className="ml-auto pl-3 font-semibold tnum">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

// Tooltip para elementos HTML (linhas, anéis, barras): segue o cursor e abre
// para o lado com mais espaço dentro do próprio elemento.
export function HoverTip({
  title,
  rows,
  children,
  className = "",
  style,
}: {
  title: string;
  rows: TipRow[];
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [pos, setPos] = useState<{ x: number; y: number; w: number } | null>(null);
  const track = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width });
  };
  return (
    <div className={`relative ${className}`} style={style} onMouseMove={track} onMouseEnter={track} onMouseLeave={() => setPos(null)}>
      {children}
      {pos && <ChartTooltip x={pos.x} y={pos.y} width={pos.w} title={title} rows={rows} />}
    </div>
  );
}

// ---- Rótulos de dados sem sobreposição ----
export interface LabelCand {
  x: number; // centro do texto
  y: number; // linha de base
  text: string;
  priority: number; // maior = colocado primeiro
}

export interface PlacedLabel {
  x: number;
  y: number;
  text: string;
}

type Box = [number, number, number, number]; // x0, y0, x1, y1

export function textBox(x: number, y: number, text: string, fontSize = 10.5): Box {
  const w = text.length * fontSize * 0.6;
  return [x - w / 2, y - fontSize, x + w / 2, y + 2];
}

// Coloca rótulos por prioridade, descartando os que colidiriam com outro
// rótulo ou com áreas reservadas; empurra para dentro os que encostam nas bordas.
export function placeLabels(
  cands: LabelCand[],
  bounds: { x0: number; x1: number },
  reserved: Box[] = [],
  fontSize = 10.5,
): PlacedLabel[] {
  const taken: Box[] = [...reserved];
  const out: PlacedLabel[] = [];
  const order = cands
    .map((c, i) => ({ c, i }))
    .sort((a, b) => b.c.priority - a.c.priority || a.i - b.i);
  for (const { c } of order) {
    const box = textBox(c.x, c.y, c.text, fontSize);
    let [x0, , x1] = box;
    const [, y0, , y1] = box;
    let x = c.x;
    if (x0 < bounds.x0) {
      x += bounds.x0 - x0;
      x1 += bounds.x0 - x0;
      x0 = bounds.x0;
    } else if (x1 > bounds.x1) {
      x -= x1 - bounds.x1;
      x0 -= x1 - bounds.x1;
      x1 = bounds.x1;
    }
    const hit = taken.some((b) => x0 < b[2] + 4 && x1 + 4 > b[0] && y0 < b[3] + 1 && y1 + 1 > b[1]);
    if (hit) continue;
    taken.push([x0, y0, x1, y1]);
    out.push({ x, y: c.y, text: c.text });
  }
  return out;
}

// Prioridade padrão para séries: último ponto, depois o maior valor.
export function seriesPriority(values: number[], i: number): number {
  const max = Math.max(...values);
  if (i === values.length - 1) return 3;
  if (values[i] === max && max > 0) return 2;
  return values[i] > 0 ? 1 : 0;
}

export function DataLabels({ labels, fill = "var(--ink)" }: { labels: PlacedLabel[]; fill?: string }) {
  return (
    <g pointerEvents="none">
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          fontSize="10.5"
          fontWeight={600}
          fill={fill}
          stroke="var(--cr-surface)"
          strokeWidth={3}
          paintOrder="stroke"
          className="tnum"
        >
          {l.text}
        </text>
      ))}
    </g>
  );
}

// Rótulos do eixo X: ~n marcas, sempre incluindo a última sem colidir.
export function xLabelIndexes(len: number, target = 6): Set<number> {
  const every = Math.max(1, Math.ceil(len / target));
  const out = new Set<number>();
  for (let i = 0; i < len; i += every) out.add(i);
  if (len > 1) {
    const last = len - 1;
    const rem = last % every;
    if (rem > 0 && rem < Math.ceil(every / 2)) out.delete(last - rem);
    out.add(last);
  }
  return out;
}

// Caminho de barra com topo arredondado (4px) e base reta.
export function barPath(x: number, y: number, w: number, h: number, r = 4): string {
  if (h <= 0 || w <= 0) return "";
  const rr = Math.min(r, w / 2, h);
  return `M ${x} ${y + h} V ${y + rr} Q ${x} ${y} ${x + rr} ${y} H ${x + w - rr} Q ${x + w} ${y} ${x + w} ${y + rr} V ${y + h} Z`;
}

// Barra horizontal com ponta direita arredondada.
export function hBarPath(x: number, y: number, w: number, h: number, r = 4): string {
  if (h <= 0 || w <= 0) return "";
  const rr = Math.min(r, h / 2, w);
  return `M ${x} ${y} H ${x + w - rr} Q ${x + w} ${y} ${x + w} ${y + rr} V ${y + h - rr} Q ${x + w} ${y + h} ${x + w - rr} ${y + h} H ${x} Z`;
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-xl px-4 py-6 text-center text-[13px]"
      style={{ background: "rgba(33,29,20,0.04)", color: "var(--ink-muted)" }}
    >
      {children}
    </div>
  );
}
