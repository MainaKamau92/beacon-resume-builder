import { NextResponse } from "next/server";
import {
  aiEnabled,
  aiJson,
  hasNovelUrl,
  sanitizeText,
  UNTRUSTED_DATA_RULES,
} from "@/lib/ai";
import type { BulletSuggestion } from "@/lib/types";

/**
 * Bullet-refinement endpoint. With an API key, a nano-model rewrites the
 * bullet (stronger verbs, lead with the result) under an honesty guardrail:
 * it may never add numbers, tools, or achievements the bullet doesn't state.
 * Falls back to the deterministic no-metric nudge without a key or on error.
 */

interface AiSuggestion {
  improved: string | null;
  label: string;
  emphasis: string;
}

const SUGGEST_SCHEMA = {
  type: "object",
  properties: {
    improved: { type: ["string", "null"] },
    label: { type: "string" },
    emphasis: { type: "string" },
  },
  required: ["improved", "label", "emphasis"],
  additionalProperties: false,
};

async function aiSuggest(text: string): Promise<BulletSuggestion | null | "failed"> {
  const bullet = sanitizeText(text, 400);
  const ai = await aiJson<AiSuggestion>({
    schemaName: "bullet_suggestion",
    schema: SUGGEST_SCHEMA,
    maxTokens: 250,
    timeoutMs: 10000,
    system: [
      "You are a resume coach improving one bullet point.",
      UNTRUSTED_DATA_RULES,
      "Rewrite the bullet with stronger verbs, leading with the result. Keep it under 25 words.",
      "HONESTY RULE: never invent numbers, metrics, tools, or achievements that the bullet does not already state. Rewording only.",
      "If the bullet is already strong, return improved: null.",
      'label: 2-4 lowercase words naming the improvement, ending with " —" (e.g. "stronger verb —").',
      "emphasis: the key improved fragment, max 8 words, no quotes.",
    ].join("\n"),
    user: `<data>\n${bullet}\n</data>`,
  });
  if (!ai) return "failed";
  if (!ai.improved) return null;
  const replacement = sanitizeText(ai.improved, 300);
  // reject degenerate or off-script output ("null", one-word answers)
  if (
    replacement.length < 12 ||
    /^(null|none|n\/a)$/i.test(replacement) ||
    hasNovelUrl(replacement, bullet)
  ) {
    return null;
  }
  return {
    label: sanitizeText(ai.label, 40) || "ai suggests —",
    emphasis: `“${sanitizeText(ai.emphasis, 80) || replacement.slice(0, 60)}”`,
    replacement,
  };
}

function heuristicSuggest(text: string): BulletSuggestion | null {
  if (/\d/.test(text)) return null;
  const trimmed = text.trim().replace(/[.\s]+$/, "");
  return {
    label: "quantify it —",
    emphasis: "“…how many, how often, or how much?”",
    replacement: `${trimmed} (add a number: how many, how often, or how much)`,
  };
}

export async function POST(request: Request) {
  const { text } = (await request.json()) as { text?: string };
  if (!text || text.trim().length < 12) {
    return NextResponse.json({ suggestion: null });
  }

  if (aiEnabled()) {
    const suggestion = await aiSuggest(text);
    if (suggestion !== "failed") {
      return NextResponse.json({ suggestion });
    }
  }
  return NextResponse.json({ suggestion: heuristicSuggest(text) });
}
