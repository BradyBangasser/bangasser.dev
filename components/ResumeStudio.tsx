"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { compileResume } from "@/lib/typst-render";
import {
  keywordTailor, webllmTailor, loadEngine, hasWebGPU, MODEL_SIZE,
} from "@/lib/tailor";

type Variant = { data: string; typ: string; template: string; pages: number };
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

  // Everything is compiled in the browser from Typst — no PDFs are shipped.
  const [compiledUrl, setCompiledUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"compiling" | "ready" | "error">("compiling");
  const [attempt, setAttempt] = useState(0);
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
      .then((url) => { if (alive) { setBlob(url); setStatus("ready"); } })
      .catch(() => { if (alive) setStatus("error"); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, template, attempt]);

  useEffect(() => () => { if (lastBlob.current) URL.revokeObjectURL(lastBlob.current); }, []);

  const viewUrl = compiledUrl;
  const fileName = `brady-bangasser-${preset}-${length}-${template}.pdf`;

  // auth + client-side tailoring (no server, no API cost)
  const [me, setMe] = useState<{ login: string | null }>({ login: null });
  const [webgpu, setWebgpu] = useState(false);
  const [jd, setJd] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMsg, setAiMsg] = useState<string | null>(null);
  const [modelState, setModelState] = useState<"off" | "loading" | "ready" | "error">("off");
  const [progress, setProgress] = useState(0);
  const engineRef = useRef<unknown>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then(setMe).catch(() => {});
    setWebgpu(hasWebGPU());
  }, []);

  // Download + start the in-browser model. Only reachable once signed in and
  // after the visitor explicitly clicks to consent (the model is ~0.9 GB).
  async function enableModel() {
    setModelState("loading");
    setProgress(0);
    try {
      engineRef.current = await loadEngine((fraction) => setProgress(fraction));
      setModelState("ready");
    } catch {
      setModelState("error");
    }
  }

  async function runTailor(useModel: boolean) {
    if (jd.trim().length < 30) return;
    setAiBusy(true);
    setAiMsg(null);
    try {
      const result = useModel && engineRef.current
        ? await webllmTailor(jd, manifest, engineRef.current)
        : keywordTailor(jd, manifest);
      setPreset(result.preset);
      setLength(result.length);
      setTemplate(result.template);
      setAiMsg(result.rationale);
    } catch {
      setAiMsg("Couldn't match the posting — try again.");
    } finally {
      setAiBusy(false);
    }
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
            {viewUrl ? (
              <a href={viewUrl} download={fileName}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-bg no-underline transition-opacity hover:opacity-90">
                Download PDF
              </a>
            ) : (
              <span className="cursor-default rounded-lg bg-accent/40 px-5 py-2.5 text-sm font-medium text-bg">
                {status === "error" ? "Compile failed" : "Compiling…"}
              </span>
            )}
            {viewUrl && (
              <a href={viewUrl} target="_blank" rel="noreferrer"
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink no-underline transition-colors hover:border-accent/50 hover:text-accent">
                Open in new tab
              </a>
            )}
            {current?.typ && (
              <a href={current.typ} download={`${fileName.replace(/\.pdf$/, "")}.typ`}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink no-underline transition-colors hover:border-accent/50 hover:text-accent">
                Download .typ
              </a>
            )}
            {status === "error" && (
              <button onClick={() => setAttempt((a) => a + 1)}
                className="rounded-lg border border-accent/50 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10">
                Retry
              </button>
            )}
            {current && (
              <span className="font-mono text-xs text-ink-faint">
                {current.pages} page{current.pages > 1 ? "s" : ""}
                {status === "compiling" && " · compiling in your browser…"}
                {status === "ready" && " · compiled in your browser"}
                {status === "error" && " · compile failed"}
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
            <p className="mb-3 text-sm text-ink-muted">
              Paste a posting and get pointed to the best-fit version. Runs entirely in your browser.
            </p>

            {!me.login ? (
              <p className="text-sm text-ink-muted">
                <a href="/api/auth/github" className="text-accent">Sign in with GitHub</a> to use tailoring.
              </p>
            ) : (
              <>
                <textarea value={jd} onChange={(e) => setJd(e.target.value)} rows={4}
                  placeholder="Paste the job description..."
                  className="w-full resize-y rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-accent/60" />

                {webgpu ? (
                  modelState === "off" ? (
                    <div className="mt-3 rounded-lg border border-border-subtle bg-bg-elevated px-4 py-3">
                      <p className="text-sm text-ink-muted">
                        Optionally run a small AI model <span className="text-ink">entirely in your browser</span> —
                        private, free, nothing sent to a server. It downloads once ({MODEL_SIZE}) and is cached after.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={enableModel}
                          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90">
                          Enable &amp; download ({MODEL_SIZE})
                        </button>
                        <button onClick={() => runTailor(false)} disabled={aiBusy || jd.trim().length < 30}
                          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-40">
                          {aiBusy ? "Matching…" : "Use quick keyword match"}
                        </button>
                      </div>
                    </div>
                  ) : modelState === "loading" ? (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between font-mono text-xs text-ink-faint">
                        <span>Downloading model…</span><span>{Math.round(progress * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${Math.round(progress * 100)}%` }} />
                      </div>
                    </div>
                  ) : modelState === "ready" ? (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button onClick={() => runTailor(true)} disabled={aiBusy || jd.trim().length < 30}
                        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-40">
                        {aiBusy ? "Matching…" : "Find my best-fit resume"}
                      </button>
                      <span className="font-mono text-xs text-ink-faint">in-browser model ready</span>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-ink-muted">
                      Couldn&apos;t load the in-browser model.{" "}
                      <button onClick={enableModel} className="text-accent underline">retry</button>{" "}or{" "}
                      <button onClick={() => runTailor(false)} className="text-accent underline">use keyword matching</button>.
                    </p>
                  )
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button onClick={() => runTailor(false)} disabled={aiBusy || jd.trim().length < 30}
                      className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-40">
                      {aiBusy ? "Matching…" : "Find my best-fit resume"}
                    </button>
                    <span className="font-mono text-xs text-ink-faint">keyword match (WebGPU not available)</span>
                  </div>
                )}

                {aiMsg && <p className="mt-3 text-sm text-ink-muted">{aiMsg}</p>}
              </>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="flex min-h-[78vh] items-center justify-center overflow-hidden rounded-xl border border-border bg-bg-elevated">
            {viewUrl ? (
              <object data={`${viewUrl}#toolbar=0`} type="application/pdf" className="h-[78vh] w-full">
                <div className="p-6 text-sm text-ink-muted">
                  Preview unavailable here. <a href={viewUrl} className="text-accent">Open the PDF</a>.
                </div>
              </object>
            ) : status === "error" ? (
              <div className="p-6 text-center text-sm text-ink-muted">
                Couldn&apos;t compile the resume in your browser.{" "}
                <button onClick={() => setAttempt((a) => a + 1)} className="text-accent underline">Retry</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 p-6 text-sm text-ink-muted">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" aria-hidden="true" />
                Compiling in your browser…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
