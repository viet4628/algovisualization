import { useEffect, useMemo, useState } from "react";
import { sortingAlgorithms, type SortingKey } from "@/lib/algorithms/sorting";
import { PlayerControls } from "@/components/PlayerControls";
import { usePlayer } from "@/lib/usePlayer";
import { supabase } from "@/integrations/supabase/client";
import { Shuffle } from "lucide-react";
import { toast } from "sonner";

function randomArray(n: number) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
}

export function SortingVisualizer() {
  const [algo, setAlgo] = useState<SortingKey>("bubble");
  const [size, setSize] = useState(12);
  const [arr, setArr] = useState<number[]>(() => randomArray(12));
  const [customInput, setCustomInput] = useState("");

  const steps = useMemo(() => sortingAlgorithms[algo].fn(arr), [algo, arr]);
  const player = usePlayer(steps.length);
  const cur = steps[player.step] ?? steps[0];
  const max = Math.max(...arr, 1);
  const meta = sortingAlgorithms[algo];

  useEffect(() => {
    setArr(randomArray(size));
  }, [size]);

  async function logRun() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Đăng nhập để lưu lịch sử");
      return;
    }
    const { error } = await supabase.from("algorithm_history").insert({
      user_id: user.id,
      algorithm: meta.name,
      category: "Sắp xếp",
      input_data: { array: arr },
    });
    if (error) toast.error(error.message);
    else toast.success("Đã lưu vào lịch sử");
  }

  function applyCustom() {
    const nums = customInput.split(/[, ]+/).map(Number).filter((n) => !isNaN(n)).slice(0, 30);
    if (nums.length >= 2) {
      setArr(nums);
      setSize(nums.length);
    } else {
      toast.error("Nhập ít nhất 2 số, cách nhau bởi dấu phẩy");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="font-serif text-base font-semibold mb-3">Thuật toán</h3>
          <div className="space-y-1.5">
            {Object.entries(sortingAlgorithms).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setAlgo(k as SortingKey)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  algo === k ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <div className="font-medium">{v.name}</div>
                <div className={`text-xs font-mono ${algo === k ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {v.complexity}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <h3 className="font-serif text-base font-semibold">Dữ liệu đầu vào</h3>
          <div>
            <label className="text-xs text-muted-foreground">Kích thước: {size}</label>
            <input type="range" min={4} max={24} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-[oklch(0.32_0.08_255)]" />
          </div>
          <button onClick={() => setArr(randomArray(size))} className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-sm hover:bg-muted">
            <Shuffle className="h-3.5 w-3.5" /> Mảng ngẫu nhiên
          </button>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Nhập mảng tùy chỉnh</label>
            <input value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="vd: 5,3,8,1,9" className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm" />
            <button onClick={applyCustom} className="w-full rounded-md bg-secondary py-1.5 text-sm font-medium hover:opacity-90">Áp dụng</button>
          </div>
          <button onClick={logRun} className="w-full rounded-md bg-accent py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90">
            Lưu vào lịch sử
          </button>
        </div>
      </aside>

      <main className="space-y-4">
        <div className="rounded-md border border-border bg-card p-5">
          <div className="flex items-baseline justify-between gap-4 mb-1">
            <h2 className="font-serif text-2xl font-semibold">{meta.name}</h2>
            <span className="font-mono text-sm text-muted-foreground">{meta.complexity}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{meta.description}</p>
        </div>

        <div className="rounded-md border border-border bg-card p-6">
          <div className="flex items-end justify-center gap-1.5 h-72">
            {cur.array.map((v, i) => {
              const isCompared = cur.compared?.includes(i);
              const isSwapped = cur.swapped?.includes(i);
              const isSorted = cur.sorted?.includes(i);
              const isPivot = cur.pivot === i;
              let bg = "bg-secondary";
              if (isSorted) bg = "bg-success";
              if (isCompared) bg = "bg-warning";
              if (isSwapped) bg = "bg-accent";
              if (isPivot) bg = "bg-destructive";
              return (
                <div key={i} className="flex flex-col items-center gap-1 transition-all" style={{ width: `${Math.max(100 / cur.array.length - 1, 3)}%` }}>
                  <div className={`w-full rounded-t-sm ${bg} transition-all duration-200`} style={{ height: `${(v / max) * 240}px` }} />
                  <span className="text-[10px] font-mono text-muted-foreground">{v}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t border-border pt-3 text-sm font-mono text-foreground min-h-[1.5em]">
            {cur.description}
          </div>
        </div>

        <PlayerControls
          step={player.step}
          total={steps.length}
          playing={player.playing}
          speed={player.speed}
          onPlay={player.play}
          onPause={player.pause}
          onPrev={player.prev}
          onNext={player.next}
          onReset={player.reset}
          onSpeed={player.setSpeed}
        />

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Legend color="bg-secondary" label="Chưa xét" />
          <Legend color="bg-warning" label="Đang so sánh" />
          <Legend color="bg-accent" label="Hoán đổi" />
          <Legend color="bg-destructive" label="Pivot" />
          <Legend color="bg-success" label="Đã sắp xếp" />
        </div>
      </main>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  );
}
