"use client";

import { useEffect, useState } from "react";

// Número que sobe de 0 até o valor ao aparecer.
export default function CountUp({
  value,
  format,
  duration = 1400,
}: {
  value: number;
  format: "brl" | "int";
  duration?: number;
}) {
  const [v, setV] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  const text =
    format === "brl"
      ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
      : Math.round(v).toLocaleString("pt-BR");
  return <>{text}</>;
}
