"use client";

import { useCallback, useEffect, useState } from "react";

const RETRY_DELAYS_MS = [0, 3000, 8000];

// Quando a página estática saiu sem dados, busca no navegador pela rota de
// API, tentando algumas vezes. Com dados já presentes, não faz nada.
export function useFallbackData<T extends { ok: boolean }>(initial: T, url: string) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(!initial.ok);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (data.ok) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      for (const delay of RETRY_DELAYS_MS) {
        if (delay) await new Promise((r) => setTimeout(r, delay));
        if (cancelled) return;
        try {
          const res = await fetch(url, { cache: "no-store" });
          const json = (await res.json()) as T;
          if (json.ok) {
            if (!cancelled) setData(json);
            break;
          }
        } catch {
          // tenta de novo
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // `attempt` permite o botão "tentar de novo".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { data, loading: loading && !data.ok, retry };
}
