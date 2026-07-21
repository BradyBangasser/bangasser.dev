"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { compileResume } from "@/lib/typst-render";

type Variant = { file: string; data: string; typ: string; template: string; pages: number };
type Manifest = {
  presets: Record<string, { label: string; headline: string }>;
  lengths: string[];
  templates: string[];
  default: string;
  files: Record<string, Variant>;
};

const LENGTH_LABEL: Record<string, string> = { onepage: "1 page", twopage: "2 page", full: "Full CV" };
const TEMPLATE_LABEL: Record<string, string> = { designed: "Designed", ats: "ATS-safe" };

function Segmented<T extends string>({ label, value, options, labels, onChange }: {
  label: string; value: T; options: T[]; labels: Record<string, string>; onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              value === o ? "border-accent bg-accent/10 text-accent"
                : "border-border text-ink-muted hover:border-accent/40 hover:text-ink"}`}>
            {labels[o] ?? o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ResumeStudio({ manifest }: { manifest: Manifest }) {
  const [dPreset, dLength, dTemplate] = manifest.default.split("-");
  const [preset, setPreset] = useState(dPreset);
  const [length, setLength] = useState(dLength);
  const [template, setTemplate] = useState(dTemplate);

  const current = useMemo(
    () => manifest.files[`${preset}-${length}-${template}`],
    [manifest, preset, length, template],
  );

  // in-browser compilation, with the prebuilt PDF as the always-available fallback
  const [compiledUrl, setCompiledUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "compiling" | "browser" | "prebuilt">("idle");
  const lastBlob = useRef<string | null>(null);

  const setBlob = useCallback((url: string | null) => {
    if (lastBlob.current) URL.revokeObjectURL(lastBlob.current);
    lastBlob.current = url;
    setCompiledUrl(url);
  }, []);

  useEffect(() => {
    if (!current) return;
    let alive = true;
    setBlob(null);
    setStatus("compiling");
    compileResume(current.data, template as "designed" | "ats")
      .then((url) => { if (alive) { setBlob(url); setStatus("browser"); } })
      .catch(() => { if (alive) setStatus("prebuilt"); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, template]);

  useEffect(() => () => { if (lastBlob.current) URL.revokeObjectURL(lastBlob.current); }, []);

  const viewUrl = compiledUrl ?? current?.file;
  const fileName = `brady-bangasser-${preset}-${length}-${template}.pdf`;

  // auth + AI
  const [me, setMe] = useState<{ login: string | null; owner?: boolean }>({ login: null });
  const [jd, setJd] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMsg, setAiMsg] = useState<string | null>(null);
  const [needAuth, setNeedAuth] = useState(false);

  useEffect(() => { fetch("/api/auth/me").then((r) => r.json()).then(setMe).catch(() => {}); }, []);

  async function tailor() {
    setAiBusy(true); setAiMsg(null); setNeedAuth(false);
    try {
      const r = await fetch("/api/resume/tailor", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ jd }),
      });
      const data = await r.json();
      if (r.status === 401 && data.needAuth) { setNeedAuth(true); return; }
      if (!r.ok) { setAiMsg(data.error ?? "Something went wrong."); return; }
      setPreset(data.preset); setLength(data.length); setTemplate(data.template);
      setAiMsg(data.rationale || "Matched to your best-fit resume.");
    } catch { setAiMsg("Network error."); }
    finally { setAiBusy(false); }
  }

  return (
    <div className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <p className="eyebrow mb-4">// resume</p>
      <h1 className="text-3xl font-semibold sm:text-4xl">Resume</h1>
      <p className="mt-4 max-w-prose text-ink-muted">
        The default is tuned for reliability and platform roles. Switch the field,
        length, or style and the PDF recompiles in your browser.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <a href={viewUrl} download={fileName}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-bg no-underline transition-opacity hover:opacity-90">
              Download PDF
            </a>
            <a href={viewUrl} target="_blank" rel="noreferrer"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink no-underline transition-colors hover:border-accent/50 hover:text-accent">
              Open in new tab
            </a>
            {current?.typ && (
              <a href={current.typ} download={`${fileName.replace(/\.pdf$/, "")}.typ`}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink no-underline transition-colors hover:border-accent/50 hover:text-accent">
                Download .typ
              </a>
            )}
            {current && (
              <span className="font-mono text-xs text-ink-faint">
                {current.pages} page{current.pages > 1 ? "s" : ""}
                {status === "compiling" && " · compiling…"}
                {status === "browser" && " · compiled in your browser"}
                {status === "prebuilt" && " · prebuilt"}
              </span>
            )}
          </div>

          <Segmented label="field" value={preset} options={Object.keys(manifest.presets)}
            labels={Object.fromEntries(Object.entries(manifest.presets).map(([k, v]) => [k, v.label]))}
            onChange={setPreset} />
          <Segmented label="length" value={length} options={manifest.lengths} labels={LENGTH_LABEL} onChange={setLength} />
          <Segmented label="style" value={template} options={manifest.templates} labels={TEMPLATE_LABEL} onChange={setTemplate} />
          <p className="text-xs text-ink-faint">
            Designed is for humans (email, this site). ATS-safe is plainer for
            application portals that parse resumes automatically.
          </p>

          <div className="card mt-2 px-5 py-5">
            <p className="eyebrow mb-2">tailor to a job posting</p>
            <p className="mb-3 text-sm text-ink-muted">Paste a posting and get pointed to the best-fit version.</p>
            <textarea value={jd} onChange={(e) => setJd(e.target.value)} rows={4}
              placeholder="Paste the job description..."
              className="w-full resize-y rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-accent/60" />
            <div className="mt-3 flex items-center gap-3">
              <button onClick={tailor} disabled={aiBusy || jd.trim().length < 30}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-40">
                {aiBusy ? "Matching..." : "Find my best-fit resume"}
              </button>
              {me.login ? <span className="font-mono text-xs text-ink-faint">{me.owner ? "owner" : `@${me.login}`}</span> : null}
            </div>
            {needAuth && (
              <p className="mt-3 text-sm text-ink-muted">
                <a href="/api/auth/github" className="text-accent">Sign in with GitHub</a> to use tailoring (rate-limited).
              </p>
            )}
            {aiMsg && <p className="mt-3 text-sm text-ink-muted">{aiMsg}</p>}
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-xl border border-border bg-bg-elevated">
            {viewUrl ? (
              <object data={`${viewUrl}#toolbar=0`} type="application/pdf" className="h-[78vh] w-full">
                <div className="p-6 text-sm text-ink-muted">
                  Preview unavailable here. <a href={viewUrl} className="text-accent">Open the PDF</a>.
                </div>
              </object>
            ) : (
              <div className="p-6 text-sm text-ink-muted">No resume for that combination.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
