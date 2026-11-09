/** Template ids come from the registry in src/templates — any string a
 *  registered module declares. Unknown ids fall back to the first template. */
export type TemplateId = string;

export interface Contact {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  date: string;
  details: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  org: string;
  date: string;
  bullets: string[];
}

export interface Resume {
  contact: Contact;
  /** short professional profile shown at the top of most templates */
  summary?: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: string[];
}

export type SectionConfidence = "ok" | "warning";

export interface ExtractedSection {
  key: "contact" | "education" | "experience" | "skills";
  label: string;
  summary: string;
  confidence: SectionConfidence;
}

export interface ExtractionResult {
  filename: string;
  seconds: number;
  raw: string;
  sections: ExtractedSection[];
  resume: Resume;
  /** skills split out for the review screen */
  skillReview: {
    keep: string[];
    drop: string[];
    ambiguous: string[];
    /** line index in `raw` to highlight in the review pane */
    flaggedLineIndex?: number;
  };
  aiNotes: string[];
}

export interface KeywordResult {
  term: string;
  present: boolean;
}

export type EditKind = "bullet" | "skill";

export interface SuggestedEdit {
  id: string;
  kind: EditKind;
  sectionLabel: string;
  /** for kind=bullet */
  targetExperienceId?: string;
  targetBulletIndex?: number;
  oldText?: string;
  newText: string;
  /** keywords this edit introduces (used for highlight + scoring) */
  keywords: string[];
  state: "pending" | "applied" | "skipped";
}

export type VersionStatus = "draft" | "ready" | "applied";

export interface Version {
  id: string;
  jobTitle: string;
  jdText: string;
  keywords: KeywordResult[];
  score: number;
  suggestedEdits: SuggestedEdit[];
  status: VersionStatus;
  filename: string;
  editedAt: number;
}

export interface BulletSuggestion {
  label: string;
  /** full replacement text applied on "Use it" */
  replacement: string;
  /** the emphasized fragment, shown bold in the chip */
  emphasis: string;
}
