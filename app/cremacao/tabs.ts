// Abas do painel da Cremação (compartilhado entre a página do servidor e o cliente).
export const TABS = [
  { key: "geral", label: "Visão geral" },
  { key: "meta", label: "Meta Ads" },
  { key: "youtube", label: "YouTube" },
  { key: "criativos", label: "Criativos" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];
