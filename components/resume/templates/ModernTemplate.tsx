import Image from "next/image";
import type { ResumeData } from "@/lib/resume";

function lineItems(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-•]\s*/, ""));
}

export function ModernTemplate({ data }: { data: ResumeData }) {
  const { basics, experience, education, certificates, references, skills } = data;
  return (
    <div className="bg-white text-zinc-950">
      <div className="px-10 py-10">
        <header className="flex items-start justify-between gap-8">
          <div className="min-w-0 break-words">
            <h1 className="text-3xl font-semibold tracking-tight">
              {basics.fullName || " "}
            </h1>
            <p className="mt-1 text-sm text-zinc-700 break-words">
              {basics.title}
            </p>
            <p className="mt-3 text-sm text-zinc-700 break-words">
              {[
                basics.email,
                basics.phone,
                basics.location,
                basics.website,
                basics.linkedin,
              ]
                .map((x) => x?.trim())
                .filter(Boolean)
                .join("  •  ")}
            </p>
          </div>
        </header>

        {basics.summary?.trim() ? (
          <section className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
              Profile
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-800 break-words">
              {basics.summary}
            </p>
          </section>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <section className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
                Experience
              </h2>
              <div className="ml-4 h-px flex-1 bg-zinc-200" />
            </div>
            <div className="mt-4 space-y-5">
              {experience.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border border-zinc-200/90 bg-white/80 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 break-words">
                      <div className="font-semibold">{e.role || " "}</div>
                      <div className="mt-0.5 text-sm text-zinc-700">
                        {e.company}
                        {e.location ? ` • ${e.location}` : ""}
                      </div>
                    </div>
                    <div className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                      {[e.start, e.end].filter(Boolean).join(" – ")}
                    </div>
                  </div>
                  {e.bullets?.trim() ? (
                    <ul className="mt-3 space-y-1 text-sm leading-6 text-zinc-800 break-words">
                      {lineItems(e.bullets).map((b, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
              Education
            </h2>
            <div className="mt-3 space-y-4">
              {education.map((ed) => (
                <div
                  key={ed.id}
                  className="rounded-xl border border-zinc-200/90 bg-white/80 p-4"
                >
                  <div className="font-semibold break-words">
                    {ed.school || " "}
                  </div>
                  <div className="mt-0.5 text-sm text-zinc-700 break-words">
                    {ed.degree}
                  </div>
                  <div className="mt-2 text-xs text-zinc-600">
                    {[ed.start, ed.end].filter(Boolean).join(" – ")}
                    {ed.location ? ` • ${ed.location}` : ""}
                  </div>
                  {ed.details?.trim() ? (
                    <div className="mt-2 text-sm leading-6 text-zinc-800 break-words">
                      {ed.details}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {skills?.trim() ? (
              <div className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
                  Skills
                </h2>
                <div className="mt-3 rounded-xl border border-zinc-200/90 bg-white/80 p-4 text-sm leading-6 text-zinc-800 break-words">
                  {skills}
                </div>
              </div>
            ) : null}

            {certificates?.length ? (
              <div className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
                  Certificates
                </h2>
                <div className="mt-3 space-y-3 break-words">
                  {certificates.map((c) => {
                    const hasContent =
                      c.name || c.issuer || c.date || c.link || c.details;
                    if (!hasContent) return null;
                    return (
                      <div
                        key={c.id}
                        className="rounded-xl border border-zinc-200/90 bg-white/80 p-4 text-sm leading-6 text-zinc-800"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <div className="font-semibold break-words">
                            {c.name || " "}
                          </div>
                          <div className="shrink-0 text-xs text-zinc-600">
                            {c.date}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-zinc-600 break-words">
                          {[c.issuer, c.link].filter(Boolean).join(" • ")}
                        </div>
                        {c.details?.trim() ? (
                          <div className="mt-2 break-words">{c.details}</div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {references?.length ? (
              <div className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
                  References
                </h2>
                <div className="mt-3 space-y-3 break-words">
                  {references.map((r) => {
                    const hasContent =
                      r.name || r.relationship || r.email || r.phone || r.details;
                    if (!hasContent) return null;
                    return (
                      <div
                        key={r.id}
                        className="rounded-xl border border-zinc-200/90 bg-white/80 p-4 text-sm leading-6 text-zinc-800"
                      >
                        <div className="font-semibold break-words">
                          {r.name || " "}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600 break-words">
                          {[r.relationship, r.email, r.phone]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                        {r.details?.trim() ? (
                          <div className="mt-2 break-words">{r.details}</div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}


