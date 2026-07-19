// In-browser PDF compilation with typst.ts. Loaded lazily from a CDN so it
// never touches the server bundle. Mirrors the local build's virtual FS
// (/templates/*.typ, /templates/icons/*.svg, /build/data.json) so a variant
// compiles to the exact same PDF the prebuilt step produced.
//
// If anything here fails (offline, CDN blocked, font gap), callers fall back
// to the prebuilt static PDF, so the page always works.

let ready: Promise<any> | null = null;

const CDN = "https://cdn.jsdelivr.net/npm";
const SNIPPET = `${CDN}/@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs`;
const COMPILER = `${CDN}/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm`;
const RENDERER = `${CDN}/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm`;

async function getTypst() {
  if (!ready) {
    ready = (async () => {
      const mod = await import(/* webpackIgnore: true */ /* @vite-ignore */ SNIPPET);
      const $typst = mod.$typst;
      $typst.setCompilerInitOptions({ getModule: () => COMPILER });
      $typst.setRendererInitOptions({ getModule: () => RENDERER });
      // preload the shared assets once
      const files: Record<string, string> = {
        "/templates/resume.typ": "/typst/resume.typ",
        "/templates/resume-ats.typ": "/typst/resume-ats.typ",
        "/templates/icons/github.svg": "/typst/icons/github.svg",
        "/templates/icons/linkedin.svg": "/typst/icons/linkedin.svg",
      };
      await Promise.all(
        Object.entries(files).map(async ([vpath, url]) => {
          const txt = await fetch(url).then((r) => r.text());
          await $typst.addSource(vpath, txt);
        }),
      );
      return $typst;
    })().catch((e) => {
      ready = null; // allow retry
      throw e;
    });
  }
  return ready;
}

const TEMPLATE_FILE: Record<string, string> = {
  designed: "/templates/resume.typ",
  ats: "/templates/resume-ats.typ",
};

// Compile a variant to a blob URL. `dataUrl` is manifest.files[key].data.
export async function compileResume(
  dataUrl: string,
  template: "designed" | "ats",
): Promise<string> {
  const $typst = await getTypst();
  const dataText = await fetch(dataUrl).then((r) => r.text());
  await $typst.addSource("/build/data.json", dataText);
  const pdf = await $typst.pdf({
    mainFilePath: TEMPLATE_FILE[template],
    inputs: { data: "/build/data.json" },
  });
  const blob = new Blob([pdf as BlobPart], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}
