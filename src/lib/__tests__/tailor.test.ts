import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { Resume, Version } from "../types";
import {
  applyEditsToResume,
  computeScore,
  extractJobTitle,
  parseKeywords,
} from "../tailor";

/**
 * Keyword matcher + scoring regressions. Every boundary case here was a
 * real bug found by E2E runs against production with real resumes and
 * real job descriptions — see the corpus in test_docs/.
 */

function resumeWith(partial: Partial<Resume> = {}): Resume {
  return {
    contact: { name: "", email: "", phone: "", location: "", linkedin: "" },
    education: [],
    experience: [],
    skills: [],
    ...partial,
  };
}

const terms = (jd: string, resume: Resume = resumeWith()) =>
  parseKeywords(jd, resume).map((k) => k.term);

describe("parseKeywords — JD side boundaries", () => {
  it("matches every side of a slash-separated stack list", () => {
    // real JDs write "Python/FastAPI and React/Next.js/TypeScript."
    const jd = "Must know Python/FastAPI and React/Next.js/TypeScript.";
    const got = terms(jd);
    expect(got).toContain("Python");
    expect(got).toContain("React");
    expect(got).toContain("TypeScript");
  });

  it("matches a term at the end of a sentence (trailing period)", () => {
    expect(terms("Solid fundamentals in SQL.")).toContain("SQL");
  });

  it('does not turn "Next.js" into JavaScript', () => {
    // "js" alias must not fire inside a dotted name
    expect(terms("We use Next.js and GraphQL.")).not.toContain("JavaScript");
  });

  it('does not turn "JavaScript" into Java', () => {
    const got = terms("JavaScript everywhere.");
    expect(got).toContain("JavaScript");
    expect(got).not.toContain("Java");
  });

  it('does not turn "NoSQL" into SQL, but PostgreSQL is a deliberate SQL alias', () => {
    // "sql" must not substring-match inside "nosql"…
    expect(terms("NoSQL stores only.")).not.toContain("SQL");
    // …but a JD asking for PostgreSQL is asking for SQL skills (bank alias)
    expect(terms("PostgreSQL required.")).toContain("SQL");
  });

  it("still matches whole dotted/slashed terms", () => {
    expect(terms("Built with Node.js.")).toContain("Node.js");
    expect(terms("Owns the CI/CD pipeline.")).toContain("CI/CD");
  });

  it("matches a term followed by parentheses", () => {
    expect(terms("Applications using Python (FastAPI).")).toContain("Python");
  });
});

describe("parseKeywords — resume side presence", () => {
  const jd = "Python, JavaScript and SQL required.";

  it("resume with node.js does not count as JavaScript-present", () => {
    const resume = resumeWith({ skills: ["Node.js", "PostgreSQL"] });
    const js = parseKeywords(jd, resume).find((k) => k.term === "JavaScript");
    expect(js?.present).toBe(false);
  });

  it("skills and bullet text both establish presence", () => {
    const resume = resumeWith({
      skills: ["Python"],
      experience: [
        {
          id: "e1",
          title: "Engineer",
          org: "Acme",
          date: "2020",
          bullets: ["Modeled data in SQL warehouses"],
        },
      ],
    });
    const byTerm = Object.fromEntries(
      parseKeywords(jd, resume).map((k) => [k.term, k.present]),
    );
    expect(byTerm.Python).toBe(true);
    expect(byTerm.SQL).toBe(true);
    expect(byTerm.JavaScript).toBe(false);
  });
});

describe("non-tech JDs (mostly outside the keyword bank)", () => {
  it("nursing JD matches only soft-skill bank terms, never tech ones", () => {
    const jd = fs.readFileSync(
      path.join(process.cwd(), "test_docs/synthetic/jds/jd-nursing.md"),
      "utf-8",
    );
    const keywords = parseKeywords(jd, resumeWith());
    // "strong communication skills" legitimately matches Communication;
    // nothing tech-flavored may fire on a nursing posting
    for (const k of keywords) expect(k.term).toBe("Communication");
    expect(keywords.every((k) => !k.present)).toBe(true);
  });

  it("a JD with zero bank keywords scores the neutral 50", () => {
    expect(computeScore([])).toBe(50);
  });
});

describe("computeScore", () => {
  const kw = (present: boolean[]) =>
    present.map((p, i) => ({ term: `T${i}`, present: p }));

  it("full coverage reads a clean 100", () => {
    expect(computeScore(kw([true, true, true]))).toBe(100);
  });

  it("partial coverage floors around 40", () => {
    expect(computeScore(kw([false, false, false]))).toBe(40);
    expect(computeScore(kw([true, false, false]))).toBe(60);
    expect(computeScore(kw([true, true, true, true, false]))).toBe(88);
  });
});

describe("extractJobTitle", () => {
  it("takes the first line and truncates long ones", () => {
    expect(extractJobTitle("Backend Engineer\n\nAbout the job")).toBe(
      "Backend Engineer",
    );
    const long = "X".repeat(80);
    expect(extractJobTitle(long).length).toBeLessThanOrEqual(60);
  });
});

describe("applyEditsToResume", () => {
  const base = resumeWith({
    skills: ["SQL"],
    experience: [
      {
        id: "exp-1",
        title: "Engineer",
        org: "Acme",
        date: "2020",
        bullets: ["Old bullet text"],
      },
    ],
  });
  const version: Version = {
    id: "v1",
    jdText: "jd",
    jobTitle: "job",
    score: 60,
    keywords: [],
    suggestedEdits: [
      {
        id: "s1",
        kind: "bullet",
        state: "applied",
        targetExperienceId: "exp-1",
        targetBulletIndex: 0,
        oldText: "Old bullet text",
        newText: "New bullet with Python",
        keywords: ["Python"],
      },
      {
        id: "s2",
        kind: "skill",
        state: "applied",
        oldText: "",
        newText: "",
        keywords: ["Docker", "sql"],
      },
      {
        id: "s3",
        kind: "bullet",
        state: "pending",
        targetExperienceId: "exp-1",
        targetBulletIndex: 0,
        oldText: "Old bullet text",
        newText: "MUST NOT APPEAR",
        keywords: [],
      },
    ],
  } as unknown as Version;

  it("applies applied edits, skips pending, dedupes skills", () => {
    const out = applyEditsToResume(base, version);
    expect(out.experience[0].bullets[0]).toBe("New bullet with Python");
    expect(out.experience[0].bullets[0]).not.toContain("MUST NOT APPEAR");
    expect(out.skills).toContain("Docker");
    // "sql" already present as "SQL" — must not duplicate
    expect(out.skills.filter((s) => s.toLowerCase() === "sql")).toHaveLength(1);
    // base resume untouched
    expect(base.experience[0].bullets[0]).toBe("Old bullet text");
  });
});
