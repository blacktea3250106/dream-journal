import { JUNGIAN_PROMPT } from "./jungian";
import { FREUDIAN_PROMPT } from "./freudian";
import { EASTERN_PROMPT } from "./eastern";
import { SPIRITUAL_PROMPT } from "./spiritual";
import { COGNITIVE_PROMPT } from "./cognitive";
import type { DreamStyle } from "../types";

export const PROMPT_REGISTRY: Record<DreamStyle, string> = {
  jungian: JUNGIAN_PROMPT,
  freudian: FREUDIAN_PROMPT,
  eastern: EASTERN_PROMPT,
  spiritual: SPIRITUAL_PROMPT,
  cognitive: COGNITIVE_PROMPT,
};

export { USER_INPUT_TEMPLATE } from "./shared";
