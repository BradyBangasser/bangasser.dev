// Client-side résumé tailoring. No server, no API cost.
//
// Two paths:
//  - WebLLM: a small model (Llama 3.2 1B) that runs entirely in the browser on
//    WebGPU. It is only downloaded after the visitor signs in with GitHub AND
//    explicitly consents (the download is ~0.9 GB, cached afterward).
//  - Keyword scorer: an instant, zero-download fallback used when WebGPU is
//    unavailable or the model isn't loaded. Also the safety net if the model
//    returns something unparseable.

export type Manifest = {
  presets: Record<string, { label: string; headline: string }>;
  lengths: string[];
  templates: string[];
  default: string;
};

export type TailorResult = {
  preset: string;
  length: string;
  template: string;
  rationale: string;
  via: "webllm" | "keywords";
};

const PRESET_KEYWORDS: Record<string, string[]> = {
  sre: ["reliability", "sre", "site reliability", "observability", "incident",
        "on-call", "oncall", "uptime", "kubernetes", "prometheus", "platform",
        "infrastructure", "slo", "sli", "monitoring", "terraform", "ci/cd",
        "devops", "availability", "production", "scaling"],
  cloud: ["cloud", "aws", "azure", "gcp", "iam", "compliance", "nist",
          "identity", "least privilege", "cloud security", "security engineer",
          "encryption", "governance"],
  hpc: ["hpc", "high performance computing", "slurm", "cluster", "mpi", "gpu",
        "cuda", "scheduler", "supercomput", "parallel", "infiniband",
        "batch", "compute"],
  compilers: ["compiler", "llvm", " ir ", "parser", "language", "optimization",
              "codegen", "openmp", "toolchain", "static analysis", "runtime",
              "systems programming"],
  software: ["software engineer", "backend", "full stack", "full-stack", "api",
             "microservice", "golang", " go ", "rust", "typescript", "react",
             "database", "distributed", "web"],
  sales: ["sales", "account", "customer", "client", "quota", "revenue",
          "solutions engineer", "sales engineer", "pre-sales", "presales",
          "business development", "stakeholder", "demo", "onboarding",
          "relationship", "territory", "go-to-market", "technical sales"],
};

function scorePresets(jd: string): { id: string; score: number }[] {
  const t = ` ${jd.toLowerCase()} `;
  return Object.entries(PRESET_KEYWORDS)
    .map(([id, kws]) => ({ id, score: kws.reduce((s, k) => s + (t.includes(k) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score);
}

function heuristicLength(jd: string): string {
  return /(senior|staff|principal|\blead\b|research|ph\.?d|scientist|architect)/i.test(jd)
    ? "twopage" : "onepage";
}
function heuristicTemplate(jd: string): string {
  return /(applicant tracking|\bats\b|workday|greenhouse|taleo|successfactors|lever|icims|apply through|application portal|upload your resume)/i.test(jd)
    ? "ats" : "designed";
}

export function keywordTailor(jd: string, manifest: Manifest): TailorResult {
  const ranked = scorePresets(jd);
  const best = ranked[0];
  const preset = best.score > 0 ? best.id : manifest.default.split("-")[0];
  const label = manifest.presets[preset]?.label ?? preset;
  return {
    preset,
    length: heuristicLength(jd),
    template: heuristicTemplate(jd),
    rationale: best.score > 0
      ? `Matched to your ${label} resume from keywords in the posting.`
      : `No strong signal in the posting; showing your ${label} resume.`,
    via: "keywords",
  };
}

export function hasWebGPU(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

// Primary uses f16 weights (smaller, faster) but needs the WebGPU "shader-f16"
// feature; the f32 build is the compatibility fallback for GPUs without it.
export const MODEL_CANDIDATES = [
  "Llama-3.2-1B-Instruct-q4f16_1-MLC",
  "Llama-3.2-1B-Instruct-q4f32_1-MLC",
];
export const MODEL_ID = MODEL_CANDIDATES[0];
export const MODEL_SIZE = "~0.9 GB";
const WEBLLM_CDN = "https://esm.run/@mlc-ai/web-llm@0.2.84";

const MAX_TOKENS = 80;
const INFERENCE_TIMEOUT_MS = 120_000;

// Progress of a single tailoring run (not the download).
export type TailorProgress = {
  phase: "prefill" | "generating";
  fraction: number; // 0..1; stays 0 while prefilling
  tokens: number;
  elapsedMs: number;
};

let enginePromise: Promise<unknown> | null = null;

// Downloads + initializes the in-browser model. Call ONLY after auth + consent.
// Tries each candidate in turn so a GPU without f16 support still works.
export function loadEngine(
  onProgress: (fraction: number, text: string) => void,
): Promise<unknown> {
  if (!enginePromise) {
    enginePromise = (async () => {
      // hidden from the bundler so the CDN module is fetched at runtime only
      // eslint-disable-next-line no-new-func
      const importCDN = new Function("u", "return import(u)") as (u: string) => Promise<any>;
      const webllm = await importCDN(WEBLLM_CDN);
      let lastErr: unknown;
      for (const model of MODEL_CANDIDATES) {
        try {
          return await webllm.CreateMLCEngine(model, {
            initProgressCallback: (r: { progress?: number; text?: string }) =>
              onProgress(r.progress ?? 0, r.text ?? ""),
          });
        } catch (e) {
          lastErr = e;
          onProgress(0, "Trying a more compatible build...");
        }
      }
      throw lastErr ?? new Error("could not initialize the in-browser model");
    })().catch((e) => { enginePromise = null; throw e; });
  }
  return enginePromise;
}

export async function webllmTailor(
  jd: string,
  manifest: Manifest,
  engine: any,
  onProgress?: (p: TailorProgress) => void,
): Promise<TailorResult> {
  const presetLines = Object.entries(manifest.presets)
    .map(([id, p]) => `${id}: ${p.label} - ${p.headline}`).join("\n");
  const system =
    "You match a job description to the best-fitting resume preset. " +
    'Reply with ONLY a compact JSON object like {"preset":"<id>","length":"onepage|twopage","template":"designed|ats"}. ' +
    "Choose the preset whose focus best matches the role. No prose.";
  const user = `Presets:\n${presetLines}\n\nJob description:\n${jd.slice(0, 2000)}`;

  const started = Date.now();
  let text = "";
  let tokens = 0;
  onProgress?.({ phase: "prefill", fraction: 0, tokens: 0, elapsedMs: 0 });

  // A hard failure here is surfaced to the caller rather than silently
  // swallowed, so a broken model never masquerades as a keyword match.
  const stream = await engine.chat.completions.create({
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
    temperature: 0.2,
    max_tokens: MAX_TOKENS,
    stream: true,
  });
  for await (const chunk of stream) {
    const delta = chunk?.choices?.[0]?.delta?.content ?? "";
    if (delta) {
      text += delta;
      tokens += 1;
      onProgress?.({
        phase: "generating",
        fraction: Math.min(tokens / MAX_TOKENS, 0.99),
        tokens,
        elapsedMs: Date.now() - started,
      });
    }
    if (Date.now() - started > INFERENCE_TIMEOUT_MS) {
      try { await engine.interruptGenerate?.(); } catch { /* ignore */ }
      break;
    }
  }

  // Soft failure: model ran but produced nothing usable, so fall back openly.
  const fallback = keywordTailor(jd, manifest);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return { ...fallback, rationale: `${fallback.rationale} (the in-browser model gave no usable answer)` };
  }
  let obj: Record<string, unknown> = {};
  try { obj = JSON.parse(match[0]); } catch { /* keep empty */ }

  const preset = Object.keys(manifest.presets).includes(obj.preset as string)
    ? (obj.preset as string) : fallback.preset;
  const length = manifest.lengths.includes(obj.length as string)
    ? (obj.length as string) : fallback.length;
  const template = manifest.templates.includes(obj.template as string)
    ? (obj.template as string) : fallback.template;
  const label = manifest.presets[preset]?.label ?? preset;
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  return {
    preset, length, template,
    rationale: `Matched to your ${label} resume (in-browser model, ${secs}s).`,
    via: "webllm",
  };
}
