// Small presentation helpers for the live GitHub metadata carried by projects.

export function relativeTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  const then = new Date(dateStr).getTime();
  if (!then) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

const LANG_COLOR: Record<string, string> = {
  Rust: "#dea584", Python: "#3572A5", Go: "#00ADD8", TypeScript: "#3178c6",
  JavaScript: "#f1e05a", HCL: "#844FBA", Swift: "#F05138", C: "#a8b9cc",
  "C++": "#f34b7d", Shell: "#89e051", Ruby: "#701516", Java: "#b07219",
  HTML: "#e34c26", CSS: "#563d7c", Dockerfile: "#384d54", Lua: "#000080",
  Zig: "#ec915c", Nix: "#7e7eff", Makefile: "#427819",
};

export function languageColor(lang?: string | null): string {
  return (lang && LANG_COLOR[lang]) || "#5c6b7a";
}
