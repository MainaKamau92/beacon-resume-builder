import type { Resume } from "@/lib/types";

/**
 * Shared resume fixtures for template tests. Three shapes that between them
 * exercise the paths templates actually branch on:
 *  - `full`   — every section populated (the happy path)
 *  - `sparse` — no summary, no skills, one role, one degree (optional
 *               sections must hide, not render empty headers)
 *  - `empty`  — nothing filled in (templates must render placeholders, not
 *               throw on `undefined`/missing data)
 */

export const fullResume: Resume = {
  contact: {
    name: "Jordan Example",
    email: "jordan@example.com",
    phone: "+254 700 000 000",
    location: "Nairobi, Kenya",
    linkedin: "linkedin.com/in/jordan-example",
  },
  summary:
    "Seasoned Software Engineer with 7 years of expertise, specialising in back-end development and data platforms.",
  experience: [
    {
      id: "e1",
      title: "Data Engineer",
      org: "Contoso Analytics",
      date: "September 2025 – June 2026",
      bullets: [
        "Built and maintained data pipelines supporting investment analytics.",
        "Developed automation tools using Python, AWS Lambda, and Snowflake, cutting manual work by 65%.",
      ],
    },
    {
      id: "e2",
      title: "Software Engineer",
      org: "Fabrikam Systems",
      date: "2021 – 2025",
      bullets: [
        "Led migration of a monolith to microservices across three teams.",
      ],
    },
  ],
  education: [
    {
      id: "ed1",
      school: "Example University of Science and Technology",
      degree: "BSc. Information Technology",
      date: "2016 – 2020",
      details: "First Class Honours",
    },
  ],
  skills: ["Python", "TypeScript", "AWS", "Snowflake", "PostgreSQL"],
};

export const sparseResume: Resume = {
  contact: {
    name: "Jordan Example",
    email: "jordan@example.com",
    phone: "",
    location: "Nairobi, Kenya",
    linkedin: "",
  },
  summary: "",
  experience: [
    {
      id: "e1",
      title: "Data Engineer",
      org: "Contoso Analytics",
      date: "2025",
      bullets: [
        "Built and maintained data pipelines for investment analytics.",
        "Automated ETL with Python and AWS Lambda.",
      ],
    },
  ],
  education: [
    {
      id: "ed1",
      school: "Example University",
      degree: "BSc. Information Technology",
      date: "2023 – 2026",
      details: "",
    },
  ],
  skills: [],
};

export const emptyResume: Resume = {
  contact: { name: "", email: "", phone: "", location: "", linkedin: "" },
  summary: undefined,
  experience: [],
  education: [],
  skills: [],
};

/** An entry with a blank bullet, to exercise the ghost-bullet branch. */
export const ghostResume: Resume = {
  ...sparseResume,
  experience: [
    {
      id: "e1",
      title: "Data Engineer",
      org: "Contoso Analytics",
      date: "2025",
      bullets: ["A real accomplishment worth listing.", ""],
    },
  ],
};
