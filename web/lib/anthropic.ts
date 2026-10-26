import Anthropic from "@anthropic-ai/sdk";
import { PROMPT_REGISTRY, USER_INPUT_TEMPLATE } from "./prompts";
import { parseInterpretation, type InterpretationPayload } from "./interpretation";
import type { DreamStyle } from "./types";

export type { InterpretationPayload } from "./interpretation";

const MODEL_MAIN = process.env.ANTHROPIC_MODEL_MAIN ?? "claude-sonnet-4-6";

// Server-only module: imported from route handlers, never from "use client" files.
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type InterpretParams = {
  style: DreamStyle;
  dream: string;
  userContext?: string | null;
  history?: string | null;
};

export type InterpretUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
};

export async function interpretDream(params: InterpretParams): Promise<{
  payload: InterpretationPayload;
  tokens: number;
  usage: InterpretUsage;
  model: string;
}> {
  // The per-style system prompt is identical across users, so it is the cache prefix.
  // Everything user-specific goes into the user message after the breakpoint.
  const systemPrompt = PROMPT_REGISTRY[params.style];
  const userMessage = USER_INPUT_TEMPLATE({
    dream: params.dream,
    userContext: params.userContext,
    history: params.history,
  });

  const response = await client.messages.create({
    model: MODEL_MAIN,
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error("AI 回應過長被截斷，請再試一次");
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI 回應格式錯誤：缺少 text block");
  }

  const payload = parseInterpretation(textBlock.text, params.style);

  const usage: InterpretUsage = {
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
    cacheWriteTokens: response.usage.cache_creation_input_tokens ?? 0,
  };
  const tokens =
    usage.inputTokens +
    usage.outputTokens +
    usage.cacheReadTokens +
    usage.cacheWriteTokens;

  return { payload, tokens, usage, model: MODEL_MAIN };
}
