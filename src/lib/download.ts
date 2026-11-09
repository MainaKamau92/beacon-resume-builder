import type { Resume } from "./types";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Server-rendered, pixel-perfect PDF via /api/pdf (headless Chromium). */
export async function downloadResumePdf(
  resume: Resume,
  template: string,
  filename: string,
): Promise<void> {
  const res = await fetch("/api/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, template, filename }),
  });
  if (!res.ok) throw new Error(`pdf failed: ${res.status}`);
  triggerDownload(await res.blob(), `${filename}.pdf`);
}

/** Plain-text export for pasting into ATS web forms. */
export function downloadResumeText(resume: Resume, filename: string): void {
  const lines: string[] = [];
  const { contact } = resume;
  lines.push((contact.name || "Resume").toUpperCase());
  const contactBits = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
  ].filter(Boolean);
  if (contactBits.length) lines.push(contactBits.join(" | "));

  if (resume.summary?.trim()) {
    lines.push("", "SUMMARY", resume.summary.trim());
  }

  const education = resume.education.filter(
    (e) => e.school || e.degree || e.details,
  );
  if (education.length) {
    lines.push("", "EDUCATION");
    for (const e of education) {
      lines.push(
        [[e.school, e.degree].filter(Boolean).join(" - "), e.date]
          .filter(Boolean)
          .join(" | "),
      );
      if (e.details) lines.push(e.details);
    }
  }

  const experience = resume.experience.filter(
    (e) => e.title || e.org || e.bullets.some((b) => b.trim()),
  );
  if (experience.length) {
    lines.push("", "EXPERIENCE");
    for (const exp of experience) {
      lines.push(
        [[exp.title, exp.org].filter(Boolean).join(" - "), exp.date]
          .filter(Boolean)
          .join(" | "),
      );
      for (const b of exp.bullets) {
        if (b.trim()) lines.push(`- ${b.trim()}`);
      }
    }
  }

  if (resume.skills.length) {
    lines.push("", "SKILLS", resume.skills.join(", "));
  }

  triggerDownload(
    new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }),
    `${filename}.txt`,
  );
}
