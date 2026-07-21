// In-browser PDF compilation with typst.ts.
//
// Uses the ALL-IN-ONE **full** bundle, which ships the wasm compiler *and* the
// default fonts (Libertinus Serif included). The lite bundle omits fonts, which
// is why an earlier version failed to compile. Loaded from CDN via a module
// <script> that sets a global `$typst`.
//
// The document is compiled from the modular template (path-based json()/image(),
// compatible across typst versions) plus the per-variant data and icon files
// added to the compiler's virtual filesystem.

declare global {
  interface Window { $typst?: any }
}

const BUNDLE =
  "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-all-in-one.ts@0.7.0/dist/esm/index.js";

const TEMPLATE_URL: Record<string, string> = {
  designed: "/typst/resume.typ",
  ats: "/typst/resume-ats.typ",
};

let loader: Promise<any> | null = null;

function loadTypst(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.$typst) return Promise.resolve(window.$typst);
  if (!loader) {
    loader = new Promise<any>((resolve, reject) => {
      const waitForGlobal = () => {
        const start = Date.now();
        const iv = setInterval(() => {
          if (window.$typst) { clearInterval(iv); resolve(window.$typst); }
          else if (Date.now() - start > 20000) { clearInterval(iv); reject(new Error("typst global not set")); }
        }, 40);
      };
      const existing = document.getElementById("typst-bundle") as HTMLScriptElement | null;
      if (existing) { waitForGlobal(); return; }
      const s = document.createElement("script");
      s.type = "module";
      s.id = "typst-bundle";
      s.src = BUNDLE;
      s.addEventListener("load", waitForGlobal);
      s.addEventListener("error", () => reject(new Error("failed to load typst bundle")));
      document.head.appendChild(s);
    }).catch((e) => { loader = null; throw e; });
  }
  return loader;
}

// icons only need to be added once; they're referenced by absolute path
let iconsReady: Promise<void> | null = null;
function ensureIcons($typst: any): Promise<void> {
  if (!iconsReady) {
    const icons: Record<string, string> = {
      "/templates/icons/github.svg": "/typst/icons/github.svg",
      "/templates/icons/linkedin.svg": "/typst/icons/linkedin.svg",
    };
    iconsReady = Promise.all(
      Object.entries(icons).map(async ([vpath, url]) => {
        const ab = (await fetch(url).then((r) => r.arrayBuffer())) as ArrayBuffer;
        $typst.mapShadow(vpath, new Uint8Array(ab));
      }),
    ).then(() => {}).catch((e) => { iconsReady = null; throw e; });
  }
  return iconsReady;
}

// serialize compiles — the shared $typst instance isn't safe for concurrent use
let lock: Promise<unknown> = Promise.resolve();

export async function compileResume(
  dataUrl: string,
  template: "designed" | "ats",
): Promise<string> {
  const run = async (): Promise<string> => {
    const $typst = await loadTypst();
    await ensureIcons($typst);
    const [tpl, data] = await Promise.all([
      fetch(TEMPLATE_URL[template]).then((r) => r.text()),
      fetch(dataUrl).then((r) => r.text()),
    ]);
    await $typst.addSource("/build/data.json", data);
    const pdf = await $typst.pdf({ mainContent: tpl });
    return URL.createObjectURL(new Blob([pdf as BlobPart], { type: "application/pdf" }));
  };
  const result = lock.then(run, run);
  lock = result.then(() => {}, () => {});
  return result;
}
