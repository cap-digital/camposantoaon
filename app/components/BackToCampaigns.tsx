import Link from "next/link";

// Volta para a página inicial de escolha de campanha.
export default function BackToCampaigns() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-white/15"
      style={{ color: "rgba(255,255,255,0.88)" }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M8.5 3 L4.5 7 L8.5 11"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Todas as campanhas
    </Link>
  );
}
