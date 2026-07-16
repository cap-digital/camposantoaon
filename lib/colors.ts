// Cor por ENTIDADE (grupo de anúncios), fixa — nunca por posição/ranking.
// Assim a mesma categoria mantém a mesma cor entre meses e gráficos.
const CAT = ["var(--cat-1)", "var(--cat-2)", "var(--cat-3)", "var(--cat-4)"];

const KEYWORD_COLOR: { test: RegExp; color: string }[] = [
  { test: /institucional/i, color: "var(--cat-1)" },
  { test: /crema/i, color: "var(--cat-2)" },
  { test: /vel[óo]rios? online/i, color: "var(--cat-3)" },
  { test: /capela/i, color: "var(--cat-4)" },
];

const fallbackCache = new Map<string, string>();

export function groupColor(rawOrClean: string): string {
  for (const k of KEYWORD_COLOR) {
    if (k.test.test(rawOrClean)) return k.color;
  }
  // Fallback estável para categorias não previstas.
  if (!fallbackCache.has(rawOrClean)) {
    fallbackCache.set(rawOrClean, CAT[fallbackCache.size % CAT.length]);
  }
  return fallbackCache.get(rawOrClean)!;
}
