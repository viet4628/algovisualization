import { useMemo, useState } from "react";
import { stringAlgorithms, type StringKey } from "@/lib/algorithms/string";
import { PlayerControls } from "@/components/PlayerControls";
import { usePlayer } from "@/lib/usePlayer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function StringVisualizer() {
  const [algo, setAlgo] = useState<StringKey>("naive");
  const [text, setText] = useState("ABABDABACDABABCABAB");
  const [pattern, setPattern] = useState("ABABCABAB");

  const steps = useMemo(() => stringAlgorithms[algo].fn(text, pattern), [algo, text, pattern]);
  const player = usePlayer(steps.length);
  const cur = steps[player.step] ?? steps[0];
  const meta = stringAlgorithms[algo];

  async function logRun() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Đăng nhập để lưu lịch sử");
    const { error } = await supabase.from("algorithm_history").insert({
      user_id: user.id, algorithm: meta.name, category: "Khớp chuỗi",
      input_data: { text, pattern },
    });
    if (error) toast.error(error.message); else toast.success("Đã lưu");
  }

  const offset = cur ? cur.textIdx - cur.patternIdx : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="font-serif text-base font-semibold mb-3">Thuật toán</h3>
          <div className="space-y-1.5">
            {Object.entries(stringAlgorithms).map(([k, v]) => (
              <button key={k} onClick={() => setAlgo(k as StringKey)} className={`w-full rounded-md px-3 py-2 text-left text-sm ${algo === k ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <div className="font-medium">{v.name}</div>
                <div className={`text-xs font-mono ${algo === k ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{v.complexity}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <h3 className="font-serif text-base font-semibold">Đầu vào</h3>
          <div>
            <label className="text-xs text-muted-foreground">Text</label>
            <input value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Pattern</label>
            <input value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm font-mono" />
          </div>
          <button onClick={logRun} className="w-full rounded-md bg-accent py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90">Lưu vào lịch sử</button>
        </div>
      </aside>

      <main className="space-y-4">
        <div className="rounded-md border border-border bg-card p-5">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="font-serif text-2xl font-semibold">{meta.name}</h2>
            <span className="font-mono text-sm text-muted-foreground">{meta.complexity}</span>
          </div>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>

        <div className="rounded-md border border-border bg-card p-6 overflow-x-auto">
          <div className="font-mono text-sm">
            <div className="text-xs text-muted-foreground mb-1">Text</div>
            <div className="flex gap-0.5">
              {text.split("").map((c, i) => {
                const isMatchPos = cur.matches.some((m) => i >= m && i < m + pattern.length);
                const isCurrent = i === cur.textIdx && cur.status !== "done" && cur.status !== "found";
                let cls = "bg-secondary text-secondary-foreground";
                if (isMatchPos) cls = "bg-success text-success-foreground";
                if (isCurrent && cur.status === "match") cls = "bg-success text-success-foreground";
                if (isCurrent && cur.status === "mismatch") cls = "bg-destructive text-destructive-foreground";
                if (isCurrent && cur.status === "comparing") cls = "bg-warning text-warning-foreground";
                return <div key={i} className={`w-7 h-9 flex items-center justify-center rounded-sm ${cls}`}>{c}</div>;
              })}
            </div>
            <div className="flex gap-0.5 mt-0.5">
              {text.split("").map((_, i) => (
                <div key={i} className="w-7 text-[9px] text-center text-muted-foreground">{i}</div>
              ))}
            </div>

            <div className="text-xs text-muted-foreground mt-4 mb-1">Pattern (offset = {offset})</div>
            <div className="flex gap-0.5" style={{ paddingLeft: `${Math.max(0, offset) * 28}px` }}>
              {pattern.split("").map((c, i) => {
                const isCurrent = i === cur.patternIdx && cur.status !== "done" && cur.status !== "found";
                let cls = "bg-muted text-foreground";
                if (isCurrent && cur.status === "match") cls = "bg-success text-success-foreground";
                if (isCurrent && cur.status === "mismatch") cls = "bg-destructive text-destructive-foreground";
                if (isCurrent && cur.status === "comparing") cls = "bg-warning text-warning-foreground";
                return <div key={i} className={`w-7 h-9 flex items-center justify-center rounded-sm border border-border ${cls}`}>{c}</div>;
              })}
            </div>

            {cur.lps && (
              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-1">LPS</div>
                <div className="flex gap-0.5">
                  {cur.lps.map((v, i) => (
                    <div key={i} className="w-7 h-7 flex items-center justify-center rounded-sm bg-secondary text-xs">{v}</div>
                  ))}
                </div>
              </div>
            )}

            {cur.hash && (
              <div className="mt-4 text-xs">
                <span className="text-muted-foreground">Hash text:</span> <span className="text-foreground">{cur.hash.textHash}</span>
                <span className="text-muted-foreground ml-4">Hash pattern:</span> <span className="text-foreground">{cur.hash.patternHash}</span>
              </div>
            )}
          </div>
          <div className="mt-4 border-t border-border pt-3 text-sm font-mono min-h-[1.5em]">{cur.description}</div>
          <div className="mt-1 text-xs text-muted-foreground">Số match: {cur.matches.length} {cur.matches.length > 0 && `(tại: ${cur.matches.join(", ")})`}</div>
        </div>

        <PlayerControls step={player.step} total={steps.length} playing={player.playing} speed={player.speed}
          onPlay={player.play} onPause={player.pause} onPrev={player.prev} onNext={player.next} onReset={player.reset} onSpeed={player.setSpeed} />
      </main>
    </div>
  );
}
