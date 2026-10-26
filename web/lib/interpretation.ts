import { z } from "zod";
import type { DreamStyle } from "./types";

// Pure helpers shared by the API route and the tests.
// No SDK or Supabase imports here, so this file runs anywhere.

export const DREAM_STYLE_IDS = [
  "jungian",
  "freudian",
  "eastern",
  "spiritual",
  "cognitive",
] as const satisfies readonly DreamStyle[];

export const DreamStyleSchema = z.enum(DREAM_STYLE_IDS);

const SymbolSchema = z.object({
  symbol: z.string().min(1),
  meaning: z.string().min(1),
  // The prompt asks for "" when there is no personal link; tolerate a missing field too.
  personal_link: z.string().default(""),
});

export const InterpretationPayloadSchema = z.object({
  style: DreamStyleSchema,
  headline: z.string().min(1),
  symbols: z.array(SymbolSchema).default([]),
  body: z.string().min(1),
  reflection_questions: z.array(z.string().min(1)).min(1),
  extra_fields: z.record(z.string(), z.unknown()).default({}),
});

export type InterpretationPayload = z.infer<typeof InterpretationPayloadSchema>;

export class InterpretationParseError extends Error {
  constructor(
    message: string,
    readonly rawPreview: string,
  ) {
    super(message);
    this.name = "InterpretationParseError";
  }
}

/**
 * Pulls the JSON object out of a model reply. The prompt asks for bare JSON,
 * but models sometimes wrap it in a ```json fence or add a sentence around it.
 */
export function extractJsonText(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fence) return fence[1].trim();
  if (trimmed.startsWith("{")) return trimmed;
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}

/**
 * Parses and validates a model reply for one interpretation style.
 * Throws InterpretationParseError on bad JSON, schema mismatch, or a reply
 * written for a different style than the one requested.
 */
export function parseInterpretation(
  raw: string,
  expectedStyle: DreamStyle,
): InterpretationPayload {
  const preview = raw.slice(0, 300);
  let json: unknown;
  try {
    json = JSON.parse(extractJsonText(raw));
  } catch {
    throw new InterpretationParseError("AI 回應不是合法 JSON", preview);
  }

  // Fill in the style if the model left it out; it is fixed by the request anyway.
  if (json && typeof json === "object" && !("style" in json)) {
    json = { ...json, style: expectedStyle };
  }

  const result = InterpretationPayloadSchema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw new InterpretationParseError(`AI 回應格式不符：${issues}`, preview);
  }
  if (result.data.style !== expectedStyle) {
    throw new InterpretationParseError(
      `AI 回應風格不符：要求 ${expectedStyle}，收到 ${result.data.style}`,
      preview,
    );
  }
  return result.data;
}

export type HistoryDream = {
  content: string;
  mood: string | null;
  dreamed_at: string;
  tags: string[] | null;
};

/**
 * Turns recent journal entries into a compact bullet list for the <history>
 * block of the prompt. Each entry is clipped so a long journal cannot blow
 * up the input token count.
 */
export function buildHistoryContext(
  dreams: HistoryDream[],
  maxCharsPerDream = 120,
): string | null {
  if (dreams.length === 0) return null;
  return dreams
    .map((d) => {
      const mood = d.mood ? `(心情:${d.mood}) ` : "";
      const tags = d.tags && d.tags.length ? ` #${d.tags.join(" #")}` : "";
      return `- [${d.dreamed_at}] ${mood}${d.content.slice(0, maxCharsPerDream)}${tags}`;
    })
    .join("\n");
}
