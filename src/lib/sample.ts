import type { ExtractionResult, Resume } from "./types";

/** Fictional content used for initial local state and sample previews. */
export const sampleResume: Resume = {
  contact: {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "(206) 555-0142",
    location: "Seattle, WA",
    linkedin: "linkedin.com/in/janedoe",
  },
  summary:
    "Computer science senior who ships people-friendly software — built a study-group app used by 120 students and keeps calm through 6 a.m. coffee rushes.",
  education: [
    {
      id: "edu-1",
      school: "University of Washington",
      degree: "B.S. Computer Science",
      date: "Jun 2026",
      details:
        "GPA 3.7 · Dean's List · Relevant coursework: Data Structures, Databases, HCI",
    },
  ],
  experience: [
    {
      id: "exp-barista",
      title: "Barista",
      org: "Campus Coffee",
      date: "2024 – present",
      bullets: [
        "Trained 4 new team members and managed opening shifts during peak morning rush",
        "",
      ],
    },
    {
      id: "exp-studybuddy",
      title: "Course Project",
      org: "StudyBuddy App",
      date: "2025",
      bullets: [
        "Built a React study-group matching app used by 120 students in one semester",
        "Designed the PostgreSQL schema and REST API with two teammates",
      ],
    },
  ],
  skills: ["Python", "JavaScript", "React", "SQL", "Git", "Figma"],
};

export const blankResume: Resume = {
  contact: { name: "", email: "", phone: "", location: "", linkedin: "" },
  summary: "",
  education: [{ id: "edu-1", school: "", degree: "", date: "", details: "" }],
  experience: [{ id: "exp-1", title: "", org: "", date: "", bullets: ["", ""] }],
  skills: [],
};

export const sampleRawText = `JANE DOE
jane.doe@example.com | 206-555-0142 | Seattle WA

EDUCATION
University of Washington, BS Computer Science, June 2026. GPA: 3.7, Dean's List

WORK HISTORY
Campus Coffee – Barista (2024-present)
- trained 4 new team members, opening shifts
- cash handling, zero drawer discrepancies

SKILLS & INTERESTS
python, javascript (react), sql, git, figma. Also: hiking, coffee, chess club`;

export function buildSampleExtraction(filename: string): ExtractionResult {
  return {
    filename,
    seconds: 2.1,
    raw: sampleRawText,
    sections: [
      {
        key: "contact",
        label: "Contact",
        summary: "Name, email, phone, city",
        confidence: "ok",
      },
      {
        key: "education",
        label: "Education",
        summary: "1 degree, GPA, coursework",
        confidence: "ok",
      },
      {
        key: "experience",
        label: "Experience",
        summary: "2 roles, 5 bullet points",
        confidence: "ok",
      },
      {
        key: "skills",
        label: "Skills",
        summary: "Found — review formatting",
        confidence: "warning",
      },
    ],
    resume: sampleResume,
    skillReview: {
      keep: ["Python", "JavaScript (React)", "SQL", "Git"],
      drop: ["hiking", "coffee"],
      ambiguous: ["chess club"],
    },
    aiNotes: [
      'AI tidied dates ("2024-present" → "2024 – present") and capitalized job titles.',
    ],
  };
}

export const sampleJd = `Junior Software Engineer — Fintech startup. We're looking for a recent grad with experience in Python, REST APIs, and agile teams. Familiarity with AWS and CI/CD a plus. You'll ship features end to end with SQL-backed services and Git-based code review.`;
