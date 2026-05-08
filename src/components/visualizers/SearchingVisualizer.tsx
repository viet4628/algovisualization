import { useMemo, useState } from "react";
import { searchingAlgorithms } from "@/lib/algorithms/searching";
import { PlayerControls } from "@/components/PlayerControls";
import { usePlayer } from "@/lib/usePlayer";
import { Shuffle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Key = keyof typeof searchingAlgorithms;

export function SearchingVisualizer() {
  const [algo, setAlgo] = useState<Key>("linear");
  const [arr, setArr] = useState<number[]>(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 90) + 10));
  const [target, setTarget] = useState(arr[Math.floor(arr.length / 2)]);

  const steps = useMemo(() => searchingAlgorithms[algo].fn(arr, target), [algo, arr, target]);
  const player = usePlayer(steps.length);
  const cur = steps[player.step] ?? steps[0];
  const meta = searchingAlgorithms[algo];

  function regen() {
    const a = Array.from({ length: 12 }, () => Math.floor(Math.random() * 90) + 10);
    setArr(a);
    setTarget(a[Math.floor(Math.random() * a.length)]);
  }

  async function logRun() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Đăng nhập để lưu lịch sử");
    const { error } = await supabase.from("algorithm_history").insert({
      user_id: user.id, algorithm: meta.name, category: "Tìm kiếm",
      input_data: { array: arr, target },
    });
    if (error) toast.error(error.message); else toast.success("Đã lưu");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="font-serif text-base font-semibold mb-3">Thuật toán</h3>
          <div className="space-y-1.5">
            {Object.entries(searchingAlgorithms).map(([k, v]) => (
              <button key={k} onClick={() => setAlgo(k as Key)} className={`w-full rounded-md px-3 py-2 text-left text-sm ${algo === k ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <div className="font-medium">{v.name}</div>
                <div className={`text-xs font-mono ${algo === k ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{v.complexity}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <h3 className="font-serif text-base font-semibold">Tham số</h3>
          <div>
            <label className="text-xs text-muted-foreground">Giá trị cần tìm</label>
            <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm" />
          </div>
          <button onClick={regen} className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-sm hover:bg-muted">
            <Shuffle className="h-3.5 w-3.5" /> Mảng ngẫu nhiên
          </button>
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

        <div className="rounded-md border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {cur.array.map((v, i) => {
              const isCurrent = cur.current === i;
              const inRange = cur.range && i >= cur.range[0] && i <= cur.range[1];
              const found = cur.found === i;
              let cls = "bg-secondary text-secondary-foreground";
              if (cur.range && !inRange) cls = "bg-muted text-muted-foreground/50";
              if (isCurrent) cls = "bg-warning text-warning-foreground";
              if (found) cls = "bg-success text-success-foreground";
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-12 h-12 rounded-md flex items-center justify-center font-mono font-semibold transition-all ${cls}`}>{v}</div>
                  <span className="text-[10px] font-mono text-muted-foreground">[{i}]</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t border-border pt-3 text-sm font-mono min-h-[1.5em]">{cur.description}</div>
        </div>

        <PlayerControls step={player.step} total={steps.length} playing={player.playing} speed={player.speed}
          onPlay={player.play} onPause={player.pause} onPrev={player.prev} onNext={player.next} onReset={player.reset} onSpeed={player.setSpeed} />
      </main>
    </div>
  );
}
