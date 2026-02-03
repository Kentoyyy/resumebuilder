import type { ResumeData } from "@/lib/resume";

function lineItems(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-•]\s*/, ""));
}

export function HarvardTemplate({ data }: { data: ResumeData }) {
  const { basics, experience, education, certificates, references, skills } = data;
  return (
    <div className="bg-white text-slate-900">
      <div className="px-10 py-10">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {basics.fullName || " "}
          </h1>
          <p className="mt-2 text-sm text-slate-700 break-words">
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
        </header>

        {basics.summary?.trim() ? (
          <section className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
              Summary
            </h2>
            <div className="mt-2 h-px w-full bg-slate-700" />
            <p className="mt-3 text-sm leading-6 text-slate-800 break-words">
              {basics.summary}
            </p>
          </section>
        ) : null}

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
            Experience
          </h2>
          <div className="mt-2 h-px w-full bg-slate-700" />
          <div className="mt-3 space-y-4">
            {experience.map((e) => (
              <div key={e.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0 break-words">
                    <div className="font-semibold break-words">
                      {e.company || " "}
                    </div>
                    <div className="text-sm italic break-words">
                      {e.role || " "}
                    </div>
                  </div>
                  <div className="shrink-0 text-sm text-right">
                    {[e.start, e.end].filter(Boolean).join(" – ")}
                  </div>
                </div>
                <div className="mt-1 flex items-baseline justify-between text-sm">
                  <div className="text-slate-600">{e.location}</div>
                </div>
                {e.bullets?.trim() ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 break-words">
                    {lineItems(e.bullets).map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
            Education
          </h2>
          <div className="mt-2 h-px w-full bg-slate-700" />
          <div className="mt-3 space-y-4">
            {education.map((ed) => (
              <div key={ed.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold">{ed.school || " "}</div>
                    <div className="text-sm italic">{ed.degree || " "}</div>
                  </div>
                  <div className="shrink-0 text-sm">
                    {[ed.start, ed.end].filter(Boolean).join(" – ")}
                  </div>
                </div>
                <div className="mt-1 text-sm text-slate-600">{ed.location}</div>
                {ed.details?.trim() ? (
                  <div className="mt-1 text-sm leading-6 text-slate-800 break-words">
                    {ed.details}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {certificates?.length ? (
          <section className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
              Certificates
            </h2>
            <div className="mt-2 h-px w-full bg-slate-700" />
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-800 break-words">
              {certificates.map((c) => {
                const hasContent =
                  c.name || c.issuer || c.date || c.link || c.details;
                if (!hasContent) return null;
                return (
                  <div key={c.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="min-w-0 font-semibold">
                        {c.name || " "}
                      </div>
                      <div className="shrink-0 text-xs text-slate-600">
                        {c.date}
                      </div>
                    </div>
                    <div className="mt-0.5 text-xs text-slate-600 break-words">
                      {[c.issuer, c.link].filter(Boolean).join(" • ")}
                    </div>
                    {c.details?.trim() ? (
                      <div className="mt-1 text-sm break-words">{c.details}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {references?.length ? (
          <section className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
              References
            </h2>
            <div className="mt-2 h-px w-full bg-slate-700" />
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-800 break-words">
              {references.map((r) => {
                const hasContent =
                  r.name || r.relationship || r.email || r.phone || r.details;
                if (!hasContent) return null;
                return (
                  <div key={r.id}>
                    <div className="font-semibold">{r.name || " "}</div>
                    <div className="text-xs text-slate-600">
                      {[r.relationship, r.email, r.phone]
                        .filter(Boolean)
                        .join(" • ")}
                    </div>
                    {r.details?.trim() ? (
                      <div className="mt-1 text-sm break-words">{r.details}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {skills?.trim() ? (
          <section className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
              Skills
            </h2>
            <div className="mt-2 h-px w-full bg-slate-700" />
            <p className="mt-3 text-sm leading-6 text-slate-800 break-words">
              {skills}
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}


