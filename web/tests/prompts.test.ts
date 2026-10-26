import { describe, expect, it } from "vitest";
import { PROMPT_REGISTRY, USER_INPUT_TEMPLATE } from "@/lib/prompts";
import { SHARED_RULES } from "@/lib/prompts/shared";
import { DREAM_STYLES } from "@/lib/types";

// extra_fields each school must ask the model for. Keeping this list in the test
// means a prompt edit that drops a field fails CI instead of silently changing the UI.
const REQUIRED_EXTRA_FIELDS: Record<string, string[]> = {
  jungian: ["archetypes_detected", "compensation_hypothesis"],
  freudian: ["dreamwork_observed", "latent_hypothesis", "childhood_link"],
  eastern: ["zhougong_matches", "five_elements", "life_areas_to_watch", "practical_advice"],
  spiritual: ["tarot_resonance", "elemental_balance", "soul_theme", "gentle_ritual"],
  cognitive: [
    "likely_day_residue",
    "emotion_processing_focus",
    "sleep_health_note",
    "red_flags",
  ],
};

describe("prompt registry", () => {
  it("has exactly one prompt per style", () => {
    expect(Object.keys(PROMPT_REGISTRY).sort()).toEqual(
      DREAM_STYLES.map((s) => s.id).sort(),
    );
  });

  it.each(DREAM_STYLES.map((s) => s.id))(
    "%s prompt embeds the shared rules and output contract",
    (style) => {
      const prompt = PROMPT_REGISTRY[style];
      expect(prompt).toContain(SHARED_RULES);
      expect(prompt).toContain('"reflection_questions"');
    },
  );

  it("each style prompt is distinct", () => {
    const bodies = Object.values(PROMPT_REGISTRY).map((p) =>
      p.replace(SHARED_RULES, ""),
    );
    expect(new Set(bodies).size).toBe(bodies.length);
  });

  it("covers every style in REQUIRED_EXTRA_FIELDS", () => {
    expect(Object.keys(REQUIRED_EXTRA_FIELDS).sort()).toEqual(
      DREAM_STYLES.map((s) => s.id).sort(),
    );
  });

  it.each(Object.entries(REQUIRED_EXTRA_FIELDS))(
    "%s prompt asks for its extra_fields",
    (style, fields) => {
      for (const f of fields) {
        expect(PROMPT_REGISTRY[style as keyof typeof PROMPT_REGISTRY]).toContain(f);
      }
    },
  );

  it("system prompts contain no per-request data, so they stay cacheable", () => {
    for (const prompt of Object.values(PROMPT_REGISTRY)) {
      expect(prompt).not.toMatch(/<dream>|<history>|<user_context>/);
      expect(prompt).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    }
  });
});

describe("USER_INPUT_TEMPLATE", () => {
  it("wraps each input in its own tag", () => {
    const msg = USER_INPUT_TEMPLATE({
      dream: "夢見老火車站",
      userContext: "下週要出遊",
      history: "- [2026-05-01] 趕不上車",
    });
    expect(msg).toContain("<dream>\n夢見老火車站\n</dream>");
    expect(msg).toContain("<user_context>\n下週要出遊\n</user_context>");
    expect(msg).toContain("<history>\n- [2026-05-01] 趕不上車\n</history>");
  });

  it("uses explicit placeholders when context and history are missing", () => {
    const msg = USER_INPUT_TEMPLATE({ dream: "夢", userContext: null, history: null });
    expect(msg).toContain("（使用者未提供）");
    expect(msg).toContain("（無歷史日記摘要）");
  });
});
