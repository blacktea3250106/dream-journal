import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { DREAM_STYLES, type Interpretation } from "@/lib/types";

type Props = {
  interpretation: Interpretation;
};

type RedFlags = { value?: boolean; note?: string };

export function InterpretationCard({ interpretation }: Props) {
  const meta = DREAM_STYLES.find((s) => s.id === interpretation.style);

  // 認知派若標記紅旗，必須顯眼 escalation（PRD §10、AGENTS.md 不可妥協規則）
  const redFlags = (
    interpretation.extra_fields as { red_flags?: RedFlags } | undefined
  )?.red_flags;
  const showEscalation =
    interpretation.style === "cognitive" && redFlags?.value === true;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta?.emoji ?? "💭"}</span>
          <div>
            <CardTitle className="text-base">{meta?.label}</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {meta?.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-5">
        <div>
          <p className="text-base font-medium leading-relaxed">
            {interpretation.headline}
          </p>
        </div>

        {showEscalation && (
          <div className="rounded-lg border border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <span aria-hidden>⚠️</span>
              我們留意到一些訊號
            </h3>
            {redFlags?.note && (
              <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                {redFlags.note}
              </p>
            )}
            <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
              這個 app 是自我探索工具，不能取代心理諮商。如果你正在經歷強烈的情緒困擾，
              以下台灣免費專線 24 小時都有人接聽，請不要一個人撐：
            </p>
            <ul className="text-sm space-y-1 text-amber-900 dark:text-amber-100">
              <li>
                <span className="font-mono font-semibold">1925</span> — 衛福部安心專線（24 小時、免付費）
              </li>
              <li>
                <span className="font-mono font-semibold">1995</span> — 生命線
              </li>
              <li>
                <span className="font-mono font-semibold">1980</span> — 張老師專線
              </li>
            </ul>
          </div>
        )}

        {interpretation.symbols.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              符號
            </h3>
            <ul className="space-y-1.5 text-sm">
              {interpretation.symbols.map((s, i) => (
                <li key={i}>
                  <span className="font-medium">{s.symbol}</span>
                  <span className="text-slate-500"> — {s.meaning}</span>
                  {s.personal_link && (
                    <span className="block text-xs text-slate-500 mt-0.5">
                      ↳ {s.personal_link}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="dream-prose text-sm whitespace-pre-wrap leading-relaxed">
          {renderInlineBold(interpretation.body)}
        </div>

        {interpretation.reflection_questions.length > 0 && (
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
            <h3 className="text-sm font-semibold">反思問題</h3>
            <ul className="space-y-1.5 text-sm list-disc list-inside text-slate-700 dark:text-slate-300">
              {interpretation.reflection_questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
            進階資訊
          </summary>
          <pre className="mt-2 p-3 rounded bg-slate-100 dark:bg-slate-900 overflow-x-auto">
            {JSON.stringify(interpretation.extra_fields, null, 2)}
          </pre>
        </details>
      </CardBody>
    </Card>
  );
}

// The prompt allows light markdown in `body`; only **bold** is used in practice.
// Render it without pulling in a markdown library or using dangerouslySetInnerHTML.
function renderInlineBold(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );
}
