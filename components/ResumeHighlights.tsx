// Experience + skills pulled straight from the resume master data, so the
// About page and the resume never drift apart. Edit resume/resume.yml and run
// `npm run resumes` to refresh.
import Link from "next/link";
import data from "@/lib/resume-data.json";

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmt(v: string): string {
  if (!v || v === "present") return "Present";
  const [y, m] = v.split("-");
  return `${MONTHS[Number(m)]} ${y}`;
}

export function ResumeHighlights() {
  const experience = (data as any).experience as any[];
  const skills = (data as any).skills as any[];

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="eyebrow">experience</h2>
          <Link href="/resume" className="font-mono text-xs text-ink-muted no-underline hover:text-accent">
            full resume →
          </Link>
        </div>
        <ul className="space-y-4">
          {experience.map((x) => (
            <li key={x.id} className="border-l border-border-subtle pl-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-medium text-ink">{x.title}</p>
                <span className="font-mono text-xs text-ink-faint">
                  {fmt(x.start)} – {fmt(x.end)}
                </span>
              </div>
              <p className="text-sm text-ink-muted">{x.org}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="eyebrow mb-4">skills</h2>
        <dl className="space-y-2">
          {skills.map((g) => (
            <div key={g.group} className="grid gap-1 sm:grid-cols-[9rem_1fr]">
              <dt className="text-sm font-medium text-ink">{g.group}</dt>
              <dd className="text-sm text-ink-muted">
                {g.items.map((i: any) => i.name).join(", ")}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
