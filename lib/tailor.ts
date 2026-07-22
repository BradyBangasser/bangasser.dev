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

export const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
export const MODEL_SIZE = "~0.9 GB";
const WEBLLM_CDN = "https://esm.run/@mlc-ai/web-llm@0.2.84";

let enginePromise: Promise<unknown> | null = null;

// Downloads + initializes the in-browser model. Call ONLY after auth + consent.
export function loadEngine(onProgress: (fraction: number, text: string) => void): Promise<unknown> {
  if (!enginePromise) {
    enginePromise = (async () => {
      // hidden from the bundler so the CDN module is fetched at runtime only
      // eslint-disable-next-line no-new-func
      const importCDN = new Function("u", "return import(u)") as (u: string) => Promise<any>;
      const webllm = await importCDN(WEBLLM_CDN);
      return webllm.CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (r: { progress?: number; text?: string }) =>
          onProgress(r.progress ?? 0, r.text ?? ""),
      });
    })().catch((e) => { enginePromise = null; throw e; });
  }
  return enginePromise;
}

export async function webllmTailor(jd: string, manifest: Manifest, engine: any): Promise<TailorResult> {
  const presetLines = Object.entries(manifest.presets)
    .map(([id, p]) => `${id}: ${p.label} — ${p.headline}`).join("\n");
  const system =
    "You match a job description to the best-fitting resume preset. " +
    'Reply with ONLY a compact JSON object like {"preset":"<id>","length":"onepage|twopage","template":"designed|ats"}. ' +
    "Choose the preset whose focus best matches the role. No prose.";
  const user = `Presets:\n${presetLines}\n\nJob description:\n${jd.slice(0, 3000)}`;
  try {
    const resp = await engine.chat.completions.create({
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature: 0.2, max_tokens: 96,
    });
    const text: string = resp?.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    const obj = match ? JSON.parse(match[0]) : {};
    const fallback = keywordTailor(jd, manifest);
    const preset = Object.keys(manifest.presets).includes(obj.preset) ? obj.preset : fallback.preset;
    const length = manifest.lengths.includes(obj.length) ? obj.length : fallback.length;
    const template = manifest.templates.includes(obj.template) ? obj.template : fallback.template;
    const label = manifest.presets[preset]?.label ?? preset;
    return { preset, length, template, rationale: `Matched to your ${label} resume (in-browser model).`, via: "webllm" };
  } catch {
    return keywordTailor(jd, manifest);
  }
}
