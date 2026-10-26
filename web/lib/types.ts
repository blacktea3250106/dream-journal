export type DreamStyle =
  | "jungian"
  | "freudian"
  | "eastern"
  | "spiritual"
  | "cognitive";

export const DREAM_STYLES: { id: DreamStyle; label: string; emoji: string; description: string }[] = [
  { id: "jungian", label: "榮格派", emoji: "🌑", description: "陰影、原型、個體化" },
  { id: "freudian", label: "佛洛伊德派", emoji: "🛋", description: "潛意識慾望、童年、夢的工作" },
  { id: "eastern", label: "東方傳統", emoji: "🐉", description: "周公解夢、五行、民間象徵" },
  { id: "spiritual", label: "靈性神秘學", emoji: "🌙", description: "塔羅、占星、靈魂訊息" },
  { id: "cognitive", label: "認知神經科學", emoji: "🧠", description: "記憶整合、情緒處理、白日殘留" },
];

export type Dream = {
  id: string;
  user_id: string;
  content: string;
  mood: string | null;
  user_context: string | null;
  sleep_hours: number | null;
  tags: string[];
  dreamed_at: string;
  created_at: string;
  updated_at: string;
};

export type Symbol = {
  symbol: string;
  meaning: string;
  personal_link: string;
};

export type Interpretation = {
  id: string;
  dream_id: string;
  style: DreamStyle;
  headline: string;
  symbols: Symbol[];
  body: string;
  reflection_questions: string[];
  extra_fields: Record<string, unknown>;
  model: string;
  tokens_used: number | null;
  created_at: string;
};

export type DreamWithInterpretations = Dream & {
  interpretations: Interpretation[];
};
