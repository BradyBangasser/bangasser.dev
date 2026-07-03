import { siteConfig } from "@/lib/site-config";

export function BootSequence() {
  const lines = siteConfig.focusAreas.map((f) => f.title);

  return (
    <div
      className="card w-full max-w-xl px-5 py-4 font-mono text-[13px] leading-relaxed sm:text-sm"
      role="img"
      aria-label={`System status: research and work focused on ${lines.join(", ")}.`}
    >
      <div className="mb-3 flex items-center gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-ink-faint">build.log</span>
      </div>
      <ul className="space-y-1.5" aria-hidden="true">
        <li
          className="animate-boot-line text-ink-faint"
          style={{ animationDelay: "0ms" }}
        >
          $ init --profile=brady-bangasser
        </li>
        {lines.map((line, i) => (
          <li
            key={line}
            className="animate-boot-line flex gap-2"
            style={{ animationDelay: `${(i + 1) * 140}ms` }}
          >
            <span className="text-cyan">[ OK ]</span>
            <span className="text-ink-muted">loaded</span>
            <span className="text-ink">{line.toLowerCase()}</span>
          </li>
        ))}
        <li
          className="animate-boot-line text-accent-soft"
          style={{ animationDelay: `${(lines.length + 1) * 140}ms` }}
        >
          $ status: available for consulting
          <span className="terminal-caret" />
        </li>
      </ul>
    </div>
  );
}
