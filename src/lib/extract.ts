import type {
  EducationItem,
  ExperienceItem,
  ExtractedSection,
  ExtractionResult,
  Resume,
} from "./types";

/**
 * Deterministic resume extraction. Rule-based section detection, contact
 * regexes, entry/bullet grouping, and a skills-vs-hobbies dictionary split.
 * When `refine` is on it also applies mechanical tidying (date spacing,
 * title casing) — the seam where an LLM refinement pass can slot in later.
 */

/* ------------------------------ dictionaries ------------------------------ */

const SECTION_MATCHERS: { key: SectionKey; re: RegExp }[] = [
  {
    key: "summary",
    re: /^(professional\s+|career\s+)?(summary|profile|objective|about(\s+me)?)$/i,
  },
  { key: "education", re: /^education(\s*(&|and)\s*training)?$/i },
  {
    key: "experience",
    re: /^((work|professional|employment)\s+)?(experience|history)$|^employment$|^work\s+history$/i,
  },
  {
    key: "skills",
    re: /^((technical|key|keys|core|soft)\s+)?skills(\s*(&|and)\s*(interests|abilities|tools|competencies))?$|^skills\s*&\s*interests$|^competenc(ies|ces)$|^areas?\s+of\s+expertise$/i,
  },
  { key: "projects", re: /^(course\s+|personal\s+)?projects?(\s+experience)?$|^projects?\s*(&|and)\s*portfolio$/i },
  {
    key: "certifications",
    re: /^certifications?(\s*(&|and)\s*licenses?)?$|^licenses?(\s*(&|and)\s*certifications?)?$/i,
  },
  {
    // sections we recognize only to STOP them leaking into the open
    // section — referee contact details are common on international CVs
    // and must never become experience entries
    key: "ignored",
    re: /^(referees?|references?)(\s+(available|upon).*)?$|^additional\s+information$|^(interests?|hobbies)(\s*(&|and)\s*\w+)?$|^links?$|^social(\s+media)?$|^(selected\s+|recent\s+)?publications?$|^personal\s+(information|details|data)$/i,
  },
];

type SectionKey =
  | "summary"
  | "education"
  | "experience"
  | "skills"
  | "projects"
  | "certifications"
  | "ignored";

const KNOWN_SKILLS: string[] = [
  "python", "javascript", "typescript", "java", "c", "c++", "c#", "go", "rust",
  "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "sql", "nosql",
  "html", "css", "sass", "react", "angular", "vue", "svelte", "next.js",
  "node.js", "node", "express", "django", "flask", "rails", "spring",
  "postgresql", "mysql", "mongodb", "redis", "sqlite", "graphql", "rest",
  "rest apis", "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
  "git", "github", "gitlab", "ci/cd", "jenkins", "linux", "bash", "figma",
  "sketch", "photoshop", "illustrator", "excel", "powerpoint", "word",
  "tableau", "power bi", "jira", "agile", "scrum", "pandas", "numpy",
  "tensorflow", "pytorch", "machine learning", "data analysis",
  "communication", "leadership", "teamwork", "customer service",
  "project management", "public speaking", "writing", "editing", "salesforce",
  // marketing / business / operations
  "canva", "google analytics", "instagram", "facebook", "tiktok", "youtube",
  "seo", "sem", "copywriting", "content marketing", "social media",
  "email marketing", "mailchimp", "hubspot", "google ads", "facebook ads",
  "quickbooks", "bookkeeping", "accounting", "auditing", "financial analysis",
  "marketing", "wordpress", "shopify", "stripe", "zendesk", "notion",
  "slack", "trello", "asana", "airtable", "premiere pro", "after effects",
  "indesign", "lightroom", "autocad", "solidworks", "spanish", "french",
  "mandarin", "german", "japanese", "typing", "scheduling", "inventory",
  "cash handling", "pos systems", "data entry", "crm", "research",
  "nodejs", "snowflake", "retool", "fastapi", "celery", "kafka", "spark",
];

const HOBBY_WORDS: string[] = [
  "hiking", "coffee", "reading", "travel", "traveling", "music", "cooking",
  "baking", "gaming", "video games", "photography", "yoga", "running",
  "soccer", "basketball", "swimming", "movies", "films", "anime", "knitting",
  "gardening", "chess", "volunteering", "dancing", "painting", "drawing",
];

const DEGREE_RE =
  /\b(b\.?[as]\.?|m\.?[as]\.?|b\.?sc\.?|m\.?sc\.?|ph\.?d\.?|mba|associate'?s?|bachelor(?:'s)?(?:\s+of\s+[a-z\s]+)?|master(?:'s)?(?:\s+of\s+[a-z\s]+)?|doctorate)\b/i;

const SCHOOL_RE =
  /\b(university|college|institute|polytechnic|academy|school)\b/i;

const MONTHS =
  "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";

/**
 * A month before the year: a name ("Jun 2024") or a number ("06/2024",
 * "6.2024"). Without the numeric form, "06/2025 — 08/2026" fell through to
 * the single-year fallback, which cut out only "2025" and left "06/" and
 * "— 08/2026" in the title/org.
 */
const MONTH_PREFIX = `(?:(?:${MONTHS})\\.?\\s+|(?:0?[1-9]|1[0-2])\\s*[/.]\\s*)`;
const DATE_TOKEN = `${MONTH_PREFIX}?(?:19|20)\\d{2}`;

const DATE_RANGE_RE = new RegExp(
  `\\b(${DATE_TOKEN})\\s*(?:[-–—~]|to|until)\\s*(${DATE_TOKEN}|present|current|now)\\b`,
  "i",
);

const SINGLE_DATE_RE = new RegExp(`\\b${DATE_TOKEN}\\b`, "i");

/**
 * A role's location on its own line under the header: "Nairobi, Kenya",
 * "Nairobi, Kenya — Hybrid", "Remote". Kept off the entry-header path, where
 * the separator made it a phantom role that stole the real role's bullets.
 */
// case-sensitive on purpose: capitalised place names are the signal, and an
// "i" flag would let any lowercase comma list ("python, sql") through
const WORK_MODE =
  "[Rr]emote|[Hh]ybrid|[Oo]n-?[Ss]ite|[Ii]n-?[Oo]ffice|REMOTE|HYBRID|ON-?SITE";
const PLACE = "[A-Z][\\w.]*(?:\\s+[A-Z][\\w.]*)?";
const ROLE_LOCATION_RE = new RegExp(
  `^(?:(?:${PLACE},\\s*){1,2}${PLACE}(?:\\s*[-–—|(]\\s*(?:${WORK_MODE})\\)?)?|(?:${WORK_MODE})(?:\\s*[-–—|(]\\s*${PLACE}(?:,\\s*${PLACE})?\\)?)?)$`,
);

const BULLET_RE = /^\s*[-•*●○▪▸►▶◦‣·]\s+/;

/** A line that is nothing but a date range ("Oct 2024 - April 2025"). */
const PURE_DATE_RANGE_RE = new RegExp(`^${DATE_RANGE_RE.source}$`, "i");

/** A bare "City, Country" / "City, ST" line. */
const LOCATION_LINE_RE =
  /^[A-Z][\w.]*(?:\s+[A-Z][\w.]*)?,\s*[A-Z][\w.]*(?:\s+[A-Z][\w.]*)?$/;

/** Contact fragments can sit far from the top in multi-column resumes. */
function isContactish(line: string): boolean {
  if (/@|linkedin\.com|github\.com/i.test(line)) return true;
  if (/^(linkedin|github|portfolio|website|twitter|blog)$/i.test(line)) {
    return true;
  }
  // digits-only line = phone, unless it's really a year range
  return /^\+?[\d\s().-]{7,}$/.test(line) && !/(19|20)\d{2}/.test(line);
}

const ORG_SUFFIX_RE =
  /\b(inc|llc|ltd|corp|co|company|labs?|studio|group|coffee|cafe|app|tech|university|college|shop|store|restaurant|bank|agency)\b\.?$/i;

const TITLE_WORD_RE =
  /\b(engineer|developer|intern|barista|manager|assistant|analyst|designer|lead|tutor|cashier|server|associate|consultant|coordinator|specialist|technician|researcher|writer|teacher|instructor|volunteer|founder|president|treasurer)\b/i;

/* -------------------------------- helpers -------------------------------- */

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|[\s\-/(])([a-z])/g, (m, pre, ch) => pre + ch.toUpperCase());
}

function isAllCaps(s: string): boolean {
  const letters = s.replace(/[^a-zA-Z]/g, "");
  return letters.length >= 3 && letters === letters.toUpperCase();
}

function canonicalSkill(token: string): string {
  const lower = token.toLowerCase();
  const hit = KNOWN_SKILLS.find((k) => k === lower);
  if (!hit) return token;
  // canonical casing for well-known tokens
  const special: Record<string, string> = {
    javascript: "JavaScript", typescript: "TypeScript", "node.js": "Node.js",
    "next.js": "Next.js", node: "Node.js", html: "HTML", css: "CSS",
    sql: "SQL", nosql: "NoSQL", postgresql: "PostgreSQL", mysql: "MySQL",
    mongodb: "MongoDB", graphql: "GraphQL", rest: "REST", "rest apis": "REST APIs",
    aws: "AWS", gcp: "GCP", "ci/cd": "CI/CD", php: "PHP", mba: "MBA",
    github: "GitHub", gitlab: "GitLab", "power bi": "Power BI", sass: "Sass",
    numpy: "NumPy", pytorch: "PyTorch", tensorflow: "TensorFlow",
    matlab: "MATLAB", "c++": "C++", "c#": "C#", quickbooks: "QuickBooks",
    nodejs: "Node.js", fastapi: "FastAPI",
    seo: "SEO", sem: "SEM", tiktok: "TikTok", youtube: "YouTube",
    hubspot: "HubSpot", mailchimp: "Mailchimp", wordpress: "WordPress",
    "pos systems": "POS systems", crm: "CRM", autocad: "AutoCAD",
  };
  return special[lower] ?? titleCase(hit);
}

/* ------------------------------ core parsing ------------------------------ */

interface Parsed {
  header: string[];
  sections: Partial<Record<SectionKey, string[]>>;
  sectionLineIndex: Partial<Record<SectionKey, number>>;
}

function splitSections(lines: string[]): Parsed {
  const parsed: Parsed = { header: [], sections: {}, sectionLineIndex: {} };
  let current: SectionKey | null = null;
  const nextNonEmpty = (i: number) =>
    lines.slice(i + 1).find((l) => l.trim())?.trim() ?? "";
  const prevNonEmpty = (i: number) =>
    [...lines.slice(0, i)].reverse().find((l) => l.trim())?.trim() ?? "";

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const bare = trimmed.replace(/[.:：]+\s*$/, "");
    const match = SECTION_MATCHERS.find((m) => m.re.test(bare));
    if (match && bare.length <= 40) {
      current = match.key;
      parsed.sections[current] ??= [];
      parsed.sectionLineIndex[current] = idx;
      return;
    }
    // contact fragments (and a location line touching them) always belong to
    // the header — sidebars put them mid-document in reading order
    if (
      isContactish(trimmed) ||
      (LOCATION_LINE_RE.test(trimmed) &&
        (isContactish(nextNonEmpty(idx)) || isContactish(prevNonEmpty(idx))))
    ) {
      parsed.header.push(trimmed);
      return;
    }
    // a "Title – Company" line followed by a bare date range reopens
    // experience: multi-page/multi-column resumes resume the flow after
    // sidebar sections have interrupted it
    if (
      current !== "experience" &&
      parsed.sections.experience &&
      !BULLET_RE.test(trimmed) &&
      /\s+[–—-]\s+|\s+\|\s+/.test(trimmed) &&
      TITLE_WORD_RE.test(trimmed) &&
      PURE_DATE_RANGE_RE.test(nextNonEmpty(idx))
    ) {
      current = "experience";
    }
    if (current) parsed.sections[current]!.push(trimmed);
    else parsed.header.push(trimmed);
  });
  return parsed;
}

function extractContact(headerLines: string[], allText: string, refine: boolean) {
  const email = allText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? "";
  const phoneRaw =
    allText.match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/)?.[0] ??
    "";
  const phone =
    refine && /^\d{3}[-.\s]\d{3}[-.\s]\d{4}$/.test(phoneRaw.trim())
      ? phoneRaw.trim().replace(/^(\d{3})[-.\s](\d{3})[-.\s](\d{4})$/, "($1) $2-$3")
      : phoneRaw.trim();
  const linkedin =
    allText.match(/linkedin\.com\/(?:in\/)?[\w-]+/i)?.[0] ?? "";
  const location =
    headerLines
      .join(" | ")
      .match(/([A-Z][a-zA-Z.]+(?:\s+[A-Z][a-zA-Z.]+)?),?\s+([A-Z]{2})\b/)
      ?.slice(1)
      .join(", ") ??
    headerLines.find((l) => LOCATION_LINE_RE.test(l)) ??
    "";

  let name = "";
  for (const line of headerLines.slice(0, 4)) {
    // PDF text layers often emit apostrophes as separate items, so a name
    // like "Mung'ai" reconstructs as "Mung ' ai" and inflates the word
    // count. Rejoin letter ' letter into one word before testing.
    const clean = line
      .replace(/[|·•].*$/, "")
      .replace(/(\p{L})\s*[\u2018\u2019']\s*(\p{L})/gu, "$1'$2")
      .trim();
    if (!clean || clean.includes("@") || /\d{3}/.test(clean)) continue;
    const words = clean.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && /^[\p{L}'.\u2019-]+$/u.test(words[0])) {
      name = isAllCaps(clean) && refine ? titleCase(clean) : clean;
      break;
    }
  }
  return { name, email, phone, location, linkedin };
}

function normalizeDate(raw: string, refine: boolean, notes: Set<string>): string {
  const trimmed = raw.trim();
  if (!refine) return trimmed;
  const tight = trimmed.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (tight && !trimmed.includes(" – ")) {
    const fixed = `${tight[1].trim()} – ${tight[2].trim()}`;
    notes.add(`tidied dates ("${trimmed}" → "${fixed}")`);
    return fixed;
  }
  return trimmed;
}

const EXP_NOISE_RE =
  /^(responsibilities|duties|achievements|highlights|key\s+(responsibilities|achievements|contributions))\s*[:.]?$/i;

function parseExperience(
  lines: string[],
  idPrefix: string,
  refine: boolean,
  notes: Set<string>,
): ExperienceItem[] {
  const items: ExperienceItem[] = [];
  let current: ExperienceItem | null = null;
  let pendingDate = "";

  const pushBullet = (text: string) => {
    current!.bullets.push(
      refine && /^[a-z]/.test(text)
        ? text.charAt(0).toUpperCase() + text.slice(1)
        : text,
    );
  };
  const appendToLastBullet = (text: string) => {
    const bullets = current!.bullets;
    bullets[bullets.length - 1] =
      `${bullets[bullets.length - 1]} ${text}`.replace(/\s+/g, " ");
  };

  for (const line of lines) {
    if (EXP_NOISE_RE.test(line)) continue;

    if (BULLET_RE.test(line)) {
      const text = line.replace(BULLET_RE, "").trim();
      if (!current) {
        current = {
          id: `${idPrefix}-${items.length + 1}`,
          title: "", org: "", date: "", bullets: [],
        };
        items.push(current);
      }
      pushBullet(text);
      continue;
    }

    // non-bullet line: decide header vs. wrapped/unmarked bullet text.
    // PDFs often drop the bullet glyph, so a line with no date and no
    // title–org separator that reads like a sentence belongs to the
    // current entry as a bullet.
    let rest = line;
    let date = "";
    const range = rest.match(DATE_RANGE_RE);
    if (range) {
      date = normalizeDate(range[0], refine, notes);
      rest = rest.replace(range[0], "");
    } else {
      const single = rest.match(SINGLE_DATE_RE);
      if (single && rest.trim().length - single[0].length < 60) {
        date = single[0];
        rest = rest.replace(single[0], "");
      }
    }
    rest = rest
      .replace(/[()\[\]]/g, "")
      .replace(/\s+,/g, ",") // PDF items split before commas: "Engineer , Acme"
      .replace(/[,;|·]\s*$/, "")
      .trim();

    // a line that is only a date belongs to the entry above it (header and
    // date on separate lines), or to the next entry if none is open yet
    if (date && !rest) {
      if (current && !current.date) current.date = date;
      else pendingDate = date;
      continue;
    }

    // "Nairobi, Kenya — Hybrid" under a role header is that role's location,
    // not a new role — fold it into the org so it stays visible
    if (
      !date &&
      current &&
      current.bullets.length === 0 &&
      ROLE_LOCATION_RE.test(rest)
    ) {
      current.org = [current.org, rest].filter(Boolean).join(" · ");
      continue;
    }

    // a lowercase start mid-entry is a hard-wrapped bullet continuation —
    // never a new role header
    if (current && current.bullets.length > 0 && /^[a-z]/.test(line.trim())) {
      appendToLastBullet(line.trim());
      continue;
    }

    const hasSeparator = /\s+[–—-]\s+|\s+\|\s+|\s+at\s+/i.test(rest);
    const shortLabel =
      rest.split(/\s+/).length <= 6 && rest.length < 60 && !/[.!?]$/.test(rest);
    const looksLikeHeader = Boolean(date) || hasSeparator || shortLabel;
    if (!looksLikeHeader) {
      if (current && rest) {
        // if the previous bullet was cut mid-sentence, this line finishes it
        const last = current.bullets[current.bullets.length - 1];
        if (last && !/[.!?:]$/.test(last)) appendToLastBullet(rest);
        else pushBullet(rest);
      }
      continue;
    }

    const parts = rest
      .split(/\s+[–—-]\s+|\s+\|\s+|\s+at\s+/i)
      .map((p) => p.replace(/^[,\s]+|[,\s]+$/g, ""))
      .filter(Boolean);

    let title = "", org = "";
    if (parts.length >= 2) {
      const [a, b] = parts;
      if (TITLE_WORD_RE.test(a) && !TITLE_WORD_RE.test(b)) {
        title = a; org = b;
      } else if (TITLE_WORD_RE.test(b) && !TITLE_WORD_RE.test(a)) {
        title = b; org = a;
      } else if (ORG_SUFFIX_RE.test(a)) {
        org = a; title = b;
      } else {
        title = a; org = b;
      }
    } else if (parts.length === 1) {
      // "Title, Company 06/2024 – 08/2026": with a date on the line, one
      // comma between a title and a non-title name is the title/org split
      const comma = date ? parts[0].match(/^([^,]+),\s*([^,]+)$/) : null;
      if (
        comma &&
        TITLE_WORD_RE.test(comma[1]) &&
        !TITLE_WORD_RE.test(comma[2]) &&
        /^[A-Z0-9]/.test(comma[2])
      ) {
        title = comma[1]; org = comma[2];
      } else if (TITLE_WORD_RE.test(parts[0])) title = parts[0];
      else org = parts[0];
    } else if (!date) {
      continue; // nothing useful on this line
    }

    if (refine && title && /^[a-z]/.test(title)) {
      title = titleCase(title);
      notes.add("capitalized job titles");
    }

    current = {
      id: `${idPrefix}-${items.length + 1}`,
      title, org, date: date || pendingDate, bullets: [],
    };
    pendingDate = "";
    items.push(current);
  }
  return items.filter((i) => i.title || i.org || i.bullets.length > 0);
}

function parseEducation(lines: string[], refine: boolean): EducationItem[] {
  const items: EducationItem[] = [];
  const tidyDate = (d: string) =>
    refine ? d.replace(/\s*[-–—~]\s*/, " – ") : d;
  for (const line of lines) {
    const clean = line.replace(BULLET_RE, "").trim();
    if (!clean) continue;
    const prev = items[items.length - 1];

    // a bare date line belongs to the entry above it
    if (prev && !prev.date && PURE_DATE_RANGE_RE.test(clean)) {
      prev.date = tidyDate(clean);
      continue;
    }
    // school name hard-wrapped mid-phrase ("…University of" + "Agriculture…")
    if (prev && /\b(of|and|for|the|&)$/i.test(prev.school)) {
      prev.school = `${prev.school} ${clean.replace(/^[.,;\s]+/, "")}`;
      continue;
    }
    // a school on its own line completes the degree-only entry above it
    if (prev && !prev.school && SCHOOL_RE.test(clean) && !DEGREE_RE.test(clean)) {
      prev.school = clean.replace(/^[.,;\s]+|[.,;\s]+$/g, "");
      continue;
    }
    // continuation line (GPA / coursework) attaches to previous entry
    if (
      items.length > 0 &&
      !SCHOOL_RE.test(clean) &&
      !DEGREE_RE.test(clean)
    ) {
      const detail = clean.replace(/^[.,;\s]+/, "");
      prev.details = prev.details ? `${prev.details} · ${detail}` : detail;
      continue;
    }
    const fragments = clean.split(/,|\s+[–—|]\s+/).map((f) => f.trim()).filter(Boolean);
    let school = "", degree = "", date = "";
    const details: string[] = [];
    for (const frag of fragments) {
      if (!school && SCHOOL_RE.test(frag)) { school = frag; continue; }
      if (!degree && DEGREE_RE.test(frag)) { degree = frag; continue; }
      const d = frag.match(DATE_RANGE_RE) ?? frag.match(SINGLE_DATE_RE);
      if (!date && d && frag.replace(d[0], "").trim().length <= 2) {
        date = d[0]; continue;
      }
      details.push(frag);
    }
    if (!school && !degree) continue;
    // pull a trailing date out of the detail fragments if we missed it
    if (!date) {
      const idx = details.findIndex((f) => SINGLE_DATE_RE.test(f));
      if (idx >= 0) {
        date = details[idx].match(SINGLE_DATE_RE)![0];
        details[idx] = details[idx]
          .replace(SINGLE_DATE_RE, "")
          .replace(/^[.,;\s]+|[.,;\s]+$/g, "")
          .trim();
        if (!details[idx]) details.splice(idx, 1);
      }
    }
    items.push({
      id: `edu-${items.length + 1}`,
      school,
      degree: refine && degree ? degree.replace(/^bs\b/i, "B.S.").replace(/^ba\b/i, "B.A.").replace(/^ms\b/i, "M.S.").replace(/^ma\b/i, "M.A.") : degree,
      date: tidyDate(date),
      details: details.join(" · "),
    });
  }
  return items;
}

/**
 * Certification lines become education-style entries ("name — issuer").
 * Wrapped lines (no bullet, previous cert not sentence-final) are joined.
 */
function parseCertifications(lines: string[]): EducationItem[] {
  const certs: string[] = [];
  for (const line of lines) {
    const isBullet = BULLET_RE.test(line);
    const clean = line.replace(BULLET_RE, "").trim();
    if (!clean) continue;
    const prev = certs[certs.length - 1];
    if (!isBullet && prev && (/^[a-z]/.test(clean) || !/\.$/.test(prev))) {
      certs[certs.length - 1] = `${prev} ${clean}`;
    } else {
      certs.push(clean);
    }
  }
  return certs.map((cert, i) => {
    const cleaned = cert.replace(/\s+,/g, ",").replace(/[.\s]+$/, "");
    const split = cleaned.match(/^(.*?),\s*([^,]+)$/);
    return {
      id: `cert-${i + 1}`,
      school: split ? split[2].trim() : "",
      degree: split ? split[1].trim() : cleaned,
      date: "",
      details: "Certification",
    };
  });
}

function parseSkills(lines: string[]) {
  // grouped lists ("Programming:", "● SQL") — strip bullet glyphs and drop
  // the category label lines
  const cleaned = lines
    .map((l) => l.replace(BULLET_RE, "").trim())
    .filter((l) => l && !/[:：]$/.test(l));
  const text = cleaned.join(", ");
  const flagged = /\balso\b|interest|hobb/i.test(text);
  const tokens = text
    .split(/[,;·|]+|(?:\s+and\s+)|\.\s+/i)
    .map((t) =>
      t
        .replace(/^also:?\s*/i, "")
        // inline category labels ride the first token ("Languages: Java")
        .replace(/^[\w&/ ]{2,28}:\s*/, "")
        .replace(/[.:]+$/, "")
        // orphan parens left by splitting "(EC2, RDS, Beanstalk)"
        .replace(/^\(([^)]*)$/, "$1")
        .replace(/^([^(]*)\)$/, "$1")
        .trim(),
    )
    .filter((t) => t.length > 0 && t.length < 40);

  const keep: string[] = [];
  const drop: string[] = [];
  const ambiguous: string[] = [];
  for (const token of tokens) {
    const lower = token.toLowerCase();
    // "javascript (react)" — both parts known → keep combined
    const paren = lower.match(/^(.+?)\s*\((.+)\)$/);
    const bases = paren ? [paren[1].trim(), paren[2].trim()] : [lower];
    if (bases.every((b) => KNOWN_SKILLS.includes(b))) {
      keep.push(
        paren
          ? `${canonicalSkill(bases[0])} (${canonicalSkill(bases[1])})`
          : canonicalSkill(token),
      );
    } else if (HOBBY_WORDS.includes(lower)) {
      drop.push(lower);
    } else if (token.split(/\s+/).length <= 4) {
      // explicitly listed under SKILLS and not hobby noise — believe the
      // user (non-tech professions live outside KNOWN_SKILLS), but still
      // surface it for review/AI double-checking
      keep.push(token);
      ambiguous.push(token);
    } else {
      ambiguous.push(token);
    }
  }
  const dedupe = (a: string[]) => {
    const seen = new Set<string>();
    return a.filter((x) => {
      const k = x.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };
  return {
    keep: dedupe(keep),
    drop: dedupe(drop),
    ambiguous: dedupe(ambiguous).slice(0, 6),
    flagged: flagged || drop.length > 0 || ambiguous.length > 0,
  };
}

/* --------------------------------- entry --------------------------------- */

export function extractFromText(
  rawInput: string,
  filename: string,
  refine: boolean,
): ExtractionResult {
  const raw = rawInput
    .replace(/\u0000/g, "") // broken ToUnicode maps emit NUL for ligatures
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "  ")
    .trim();
  const lines = raw.split("\n").map((l) => l.trim());
  if (raw.replace(/\s/g, "").length < 40) {
    throw new ExtractionError(
      "We couldn't find readable text in that file. If it's a scanned PDF, try exporting a text-based version.",
    );
  }

  const notes = new Set<string>();
  const parsed = splitSections(lines);
  const contact = extractContact(parsed.header, raw, refine);

  let summary = (parsed.sections.summary ?? []).join(" ").trim();
  // only trust header prose as a profile when real sections were found —
  // otherwise the whole resume is "header" and this would grab job text
  if (!summary && Object.keys(parsed.sections).length > 0) {
    // headers without an explicit Summary section often open with a
    // profile paragraph — prose-length header lines are that paragraph
    const prose = parsed.header.filter(
      (l) =>
        !isContactish(l) &&
        !LOCATION_LINE_RE.test(l) &&
        (l.length >= 40 || (l.length >= 20 && /\.$/.test(l))),
    );
    summary = prose.join(" ").trim();
  }
  const education = [
    ...parseEducation(parsed.sections.education ?? [], refine),
    ...parseCertifications(parsed.sections.certifications ?? []),
  ];
  const experience = mergeOrphanOrgEntries([
    ...parseExperience(parsed.sections.experience ?? [], "exp", refine, notes),
    ...parseExperience(parsed.sections.projects ?? [], "proj", refine, notes),
  ]);
  const skills = parseSkills(parsed.sections.skills ?? []);

  const resume: Resume = {
    contact,
    summary,
    education,
    experience,
    skills: skills.keep.flatMap((s) => {
      const m = s.match(/^(.+?)\s*\((.+)\)$/);
      return m ? [m[1], m[2]] : [s];
    }),
  };

  const bulletCount = experience.reduce((n, e) => n + e.bullets.length, 0);
  const contactBits = [
    contact.name && "name",
    contact.email && "email",
    contact.phone && "phone",
    contact.location && "city",
  ].filter(Boolean) as string[];

  const sections: ExtractedSection[] = [
    {
      key: "contact",
      label: "Contact",
      summary: contactBits.length
        ? contactBits.join(", ").replace(/^./, (c) => c.toUpperCase())
        : "Not found — add it in the editor",
      confidence: contact.name && contact.email ? "ok" : "warning",
    },
    {
      key: "education",
      label: "Education",
      summary: education.length
        ? `${education.length} ${education.length === 1 ? "entry" : "entries"}${education.some((e) => /gpa/i.test(e.details)) ? ", GPA" : ""}${education.some((e) => e.date) ? ", dates" : ""}`
        : "Not found — add it in the editor",
      confidence: education.length > 0 ? "ok" : "warning",
    },
    {
      key: "experience",
      label: "Experience",
      summary: experience.length
        ? `${experience.length} ${experience.length === 1 ? "role" : "roles"}, ${bulletCount} bullet ${bulletCount === 1 ? "point" : "points"}`
        : "Not found — add it in the editor",
      confidence: experience.length > 0 && bulletCount > 0 ? "ok" : "warning",
    },
    {
      key: "skills",
      label: "Skills",
      summary:
        skills.keep.length + skills.ambiguous.length > 0
          ? skills.flagged
            ? "Found — review formatting"
            : `${skills.keep.length} skills`
          : "Not found — add it in the editor",
      confidence:
        skills.keep.length > 0 && !skills.flagged ? "ok" : "warning",
    },
  ];

  const skillsLineIdx = parsed.sectionLineIndex.skills;
  let flaggedLineIndex: number | undefined;
  if (skills.flagged && skillsLineIdx !== undefined) {
    // point at the line holding the first token that needs review,
    // falling back to the first line of the skills section
    const target = skills.ambiguous[0] ?? skills.drop[0];
    const hit = target
      ? lines.findIndex((l, i) => i > skillsLineIdx && l.includes(target))
      : -1;
    flaggedLineIndex =
      hit >= 0
        ? hit
        : lines.findIndex((l, i) => i > skillsLineIdx && l.trim().length > 0);
  }

  // collapse repeated date-tidy notes into one example
  const noteList = [...notes];
  const dateNotes = noteList.filter((n) => n.startsWith("tidied dates"));
  const otherNotes = noteList.filter((n) => !n.startsWith("tidied dates"));
  const merged = [...(dateNotes.length ? [dateNotes[0]] : []), ...otherNotes];
  const aiNotes =
    refine && merged.length > 0
      ? [`${merged.join(" and ").replace(/^./, (c) => c.toUpperCase())}.`]
      : [];

  return {
    filename,
    seconds: 0, // filled by the route
    raw,
    sections,
    resume,
    skillReview: {
      keep: skills.keep,
      drop: skills.drop,
      ambiguous: skills.ambiguous,
      flaggedLineIndex,
    },
    aiNotes,
  };
}

export class ExtractionError extends Error {}

/**
 * Resumes that put "Location — Org" on its own line above each role parse
 * into an orphan entry (no bullets, no date) followed by the real role with
 * an empty org. Merge each orphan into the entry that follows it.
 */
function mergeOrphanOrgEntries(entries: ExperienceItem[]): ExperienceItem[] {
  const out: ExperienceItem[] = [];
  for (let i = 0; i < entries.length; i++) {
    const cur = entries[i];
    const next = entries[i + 1];
    const isOrphan =
      cur.bullets.length === 0 && !cur.date && (cur.title || cur.org);
    if (isOrphan && next && !next.org) {
      next.org = [cur.org || cur.title, cur.org ? cur.title : ""]
        .filter(Boolean)
        .join(" — ");
      continue; // drop the orphan; its identity lives on the real role
    }
    // …and the reverse: a bare title line above an "Org, City, ST" line
    // (the standard US 3-line layout: title / org / date)
    if (isOrphan && cur.title && !cur.org && next && next.org && !next.title) {
      next.title = cur.title;
      continue;
    }
    out.push(cur);
  }
  return out;
}
