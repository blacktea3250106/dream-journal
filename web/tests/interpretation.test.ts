import { describe, expect, it } from "vitest";
import {
  buildHistoryContext,
  extractJsonText,
  InterpretationParseError,
  parseInterpretation,
} from "@/lib/interpretation";
import { DEMO_INTERPRETATIONS } from "@/lib/demo/fixtures";
import { DREAM_STYLES } from "@/lib/types";

const valid = {
  style: "jungian",
  headline: "在月台上等待屬於你的那班車",
  symbols: [{ symbol: "火車站", meaning: "轉換點", personal_link: "" }],
  body: "這個夢可能反映……",
  reflection_questions: ["那條魚想告訴你什麼？"],
  extra_fields: { archetypes_detected: ["陰影"] },
};

function omit<T extends object>(obj: T, ...keys: (keyof T)[]): Partial<T> {
  const copy: Partial<T> = { ...obj };
  for (const k of keys) delete copy[k];
  return copy;
}

describe("extractJsonText", () => {
  it("returns bare JSON unchanged", () => {
    expect(extractJsonText('{"a":1}')).toBe('{"a":1}');
  });

  it("strips a ```json fence", () => {
    expect(extractJsonText('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("strips a fence without a language tag", () => {
    expect(extractJsonText('```\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("drops prose around the object", () => {
    expect(extractJsonText('以下是解讀：\n{"a":1}\n希望有幫助')).toBe('{"a":1}');
  });
});

describe("parseInterpretation", () => {
  it("accepts a valid payload", () => {
    const out = parseInterpretation(JSON.stringify(valid), "jungian");
    expect(out.headline).toBe(valid.headline);
    expect(out.symbols).toHaveLength(1);
  });

  it("accepts a fenced payload", () => {
    const raw = "```json\n" + JSON.stringify(valid, null, 2) + "\n```";
    expect(parseInterpretation(raw, "jungian").style).toBe("jungian");
  });

  it("fills defaults for optional fields the model omits", () => {
    const rest = omit(valid, "symbols", "extra_fields", "style");
    const out = parseInterpretation(JSON.stringify(rest), "eastern");
    expect(out.style).toBe("eastern");
    expect(out.symbols).toEqual([]);
    expect(out.extra_fields).toEqual({});
  });

  it("defaults a missing personal_link to an empty string", () => {
    const payload = { ...valid, symbols: [{ symbol: "鏡子", meaning: "自我" }] };
    const out = parseInterpretation(JSON.stringify(payload), "jungian");
    expect(out.symbols[0].personal_link).toBe("");
  });

  it("rejects invalid JSON with a typed error", () => {
    expect(() => parseInterpretation("{not json", "jungian")).toThrow(
      InterpretationParseError,
    );
  });

  it("rejects a payload missing required fields", () => {
    const rest = omit(valid, "body");
    expect(() => parseInterpretation(JSON.stringify(rest), "jungian")).toThrow(
      /body/,
    );
  });

  it("rejects an empty reflection_questions list", () => {
    const payload = { ...valid, reflection_questions: [] };
    expect(() => parseInterpretation(JSON.stringify(payload), "jungian")).toThrow(
      InterpretationParseError,
    );
  });

  it("rejects a reply written for a different style", () => {
    expect(() => parseInterpretation(JSON.stringify(valid), "freudian")).toThrow(
      /風格不符/,
    );
  });

  it("does not echo the raw reply in the error message", () => {
    try {
      parseInterpretation("私人夢境內容 {broken", "jungian");
      expect.unreachable();
    } catch (err) {
      expect((err as Error).message).not.toContain("私人夢境內容");
    }
  });
});

describe("demo fixtures", () => {
  it.each(DREAM_STYLES.map((s) => s.id))(
    "%s fixture matches the production schema",
    (style) => {
      const raw = JSON.stringify({ style, ...DEMO_INTERPRETATIONS[style] });
      expect(() => parseInterpretation(raw, style)).not.toThrow();
    },
  );
});

describe("buildHistoryContext", () => {
  it("returns null for an empty journal", () => {
    expect(buildHistoryContext([])).toBeNull();
  });

  it("formats date, mood, clipped content and tags", () => {
    const out = buildHistoryContext(
      [
        {
          dreamed_at: "2026-05-01",
          mood: "😨",
          content: "一".repeat(200),
          tags: ["水", "門"],
        },
        { dreamed_at: "2026-04-28", mood: null, content: "短夢", tags: [] },
      ],
      10,
    );
    const lines = out!.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(`- [2026-05-01] (心情:😨) ${"一".repeat(10)} #水 #門`);
    expect(lines[1]).toBe("- [2026-04-28] 短夢");
  });
});
