"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Contact,
  ExtractionResult,
  Resume,
  SuggestedEdit,
  TemplateId,
  Version,
  VersionStatus,
} from "./types";
import { blankResume, sampleResume } from "./sample";
import { rescoreVersion } from "./tailor";

interface AppState {
  resume: Resume;
  versions: Version[];
  aiRefinementEnabled: boolean;
  selectedTemplate: TemplateId;
  activeVersionId: string | null;
  extraction: ExtractionResult | null;
  lastSavedAt: number | null;

  setAiRefinement: (on: boolean) => void;
  setTemplate: (t: TemplateId) => void;
  setExtraction: (e: ExtractionResult | null) => void;
  adoptExtraction: () => void;
  startBlank: () => void;

  updateContact: (patch: Partial<Contact>) => void;
  setSummary: (summary: string) => void;
  updateEducation: (id: string, patch: Partial<Resume["education"][number]>) => void;
  updateExperience: (
    id: string,
    patch: Partial<Omit<Resume["experience"][number], "bullets">>,
  ) => void;
  updateBullet: (expId: string, index: number, text: string) => void;
  addBullet: (expId: string) => void;
  removeBullet: (expId: string, index: number) => void;
  addExperience: () => void;
  removeExperience: (id: string) => void;
  addEducation: () => void;
  removeEducation: (id: string) => void;
  setSkills: (skills: string[]) => void;

  upsertVersion: (v: Version) => void;
  setActiveVersion: (id: string | null) => void;
  setEditState: (
    versionId: string,
    editId: string,
    state: SuggestedEdit["state"],
  ) => void;
  setVersionStatus: (versionId: string, status: VersionStatus) => void;
  setVersionFilename: (versionId: string, filename: string) => void;
}

function touch<T extends object>(patch: T): T & { lastSavedAt: number } {
  return { ...patch, lastSavedAt: Date.now() };
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      resume: sampleResume,
      versions: [],
      aiRefinementEnabled: true,
      selectedTemplate: "classic",
      activeVersionId: null,
      extraction: null,
      lastSavedAt: null,

      setAiRefinement: (on) => set(touch({ aiRefinementEnabled: on })),
      setTemplate: (t) => set(touch({ selectedTemplate: t })),
      setExtraction: (e) => set({ extraction: e }),
      adoptExtraction: () =>
        set((s) =>
          s.extraction ? touch({ resume: s.extraction.resume }) : s,
        ),
      startBlank: () =>
        set(touch({ resume: structuredClone(blankResume), extraction: null })),

      updateContact: (patch) =>
        set((s) =>
          touch({ resume: { ...s.resume, contact: { ...s.resume.contact, ...patch } } }),
        ),
      setSummary: (summary) =>
        set((s) => touch({ resume: { ...s.resume, summary } })),
      updateEducation: (id, patch) =>
        set((s) =>
          touch({
            resume: {
              ...s.resume,
              education: s.resume.education.map((e) =>
                e.id === id ? { ...e, ...patch } : e,
              ),
            },
          }),
        ),
      updateExperience: (id, patch) =>
        set((s) =>
          touch({
            resume: {
              ...s.resume,
              experience: s.resume.experience.map((e) =>
                e.id === id ? { ...e, ...patch } : e,
              ),
            },
          }),
        ),
      updateBullet: (expId, index, text) =>
        set((s) =>
          touch({
            resume: {
              ...s.resume,
              experience: s.resume.experience.map((e) =>
                e.id === expId
                  ? {
                      ...e,
                      bullets: e.bullets.map((b, i) => (i === index ? text : b)),
                    }
                  : e,
              ),
            },
          }),
        ),
      addBullet: (expId) =>
        set((s) =>
          touch({
            resume: {
              ...s.resume,
              experience: s.resume.experience.map((e) =>
                e.id === expId ? { ...e, bullets: [...e.bullets, ""] } : e,
              ),
            },
          }),
        ),
      removeBullet: (expId, index) =>
        set((s) =>
          touch({
            resume: {
              ...s.resume,
              experience: s.resume.experience.map((e) =>
                e.id === expId
                  ? { ...e, bullets: e.bullets.filter((_, i) => i !== index) }
                  : e,
              ),
            },
          }),
        ),
      removeExperience: (id) =>
        set((s) =>
          touch({
            resume: {
              ...s.resume,
              experience: s.resume.experience.filter((e) => e.id !== id),
            },
          }),
        ),
      addEducation: () =>
        set((s) =>
          touch({
            resume: {
              ...s.resume,
              education: [
                ...s.resume.education,
                {
                  id: `edu-${Date.now()}`,
                  school: "",
                  degree: "",
                  date: "",
                  details: "",
                },
              ],
            },
          }),
        ),
      removeEducation: (id) =>
        set((s) =>
          touch({
            resume: {
              ...s.resume,
              education: s.resume.education.filter((e) => e.id !== id),
            },
          }),
        ),
      addExperience: () =>
        set((s) =>
          touch({
            resume: {
              ...s.resume,
              experience: [
                ...s.resume.experience,
                {
                  id: `exp-${Date.now()}`,
                  title: "",
                  org: "",
                  date: "",
                  bullets: ["", ""],
                },
              ],
            },
          }),
        ),
      setSkills: (skills) =>
        set((s) => touch({ resume: { ...s.resume, skills } })),

      upsertVersion: (v) =>
        set((s) => {
          const exists = s.versions.some((x) => x.id === v.id);
          return touch({
            versions: exists
              ? s.versions.map((x) => (x.id === v.id ? v : x))
              : [v, ...s.versions],
            activeVersionId: v.id,
          });
        }),
      setActiveVersion: (id) => set({ activeVersionId: id }),
      setEditState: (versionId, editId, state) =>
        set((s) =>
          touch({
            versions: s.versions.map((v) => {
              if (v.id !== versionId) return v;
              const updated: Version = {
                ...v,
                suggestedEdits: v.suggestedEdits.map((e) =>
                  e.id === editId ? { ...e, state } : e,
                ),
                editedAt: Date.now(),
              };
              return rescoreVersion(s.resume, updated);
            }),
          }),
        ),
      setVersionStatus: (versionId, status) =>
        set((s) =>
          touch({
            versions: s.versions.map((v) =>
              v.id === versionId ? { ...v, status, editedAt: Date.now() } : v,
            ),
          }),
        ),
      setVersionFilename: (versionId, filename) =>
        set((s) =>
          touch({
            versions: s.versions.map((v) =>
              v.id === versionId ? { ...v, filename } : v,
            ),
          }),
        ),
    }),
    {
      name: "resume-builder",
      // Rehydrated manually in <StoreHydration/> to avoid SSR hydration mismatch
      skipHydration: true,
    },
  ),
);

export function activeVersionSelector(s: AppState): Version | null {
  return s.versions.find((v) => v.id === s.activeVersionId) ?? null;
}
