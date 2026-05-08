import { useMemo, useState } from "react";
import { dpAlgorithms, fibonacciDP, knapsack01, lcs, coinChange, type DPKey, type DPStep } from "@/lib/algorithms/dp";
import { PlayerControls } from "@/components/PlayerControls";
import { usePlayer } from "@/lib/usePlayer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function DPVisualizer() {
  const [algo, setAlgo] = useState<DPKey>("fib");
  const [n, setN] = useState(10);
  const [coins, setCoins] = useState("1,3,4");
  const [amount, setAmount] = useState(6);
  const [strA, setStrA] = useState("ABCBDAB");
  const [strB, setStrB] = useState("BDCAB");

  const steps: DPStep[] = useMemo(() => {
    if (algo === "fib") return fibonacciDP(n);
    if (algo === "knapsack") return knapsack01([2, 3, 4, 5], [3, 4, 5, 6], n);
    if (algo === "lcs") return lcs(strA, strB);
    return coinChange(coins.split(",").map(Number).filter((x) => !isNaN(x) && x > 0), amount);
  }, [algo, n, coins, amount, strA, strB]);

  const player = usePlayer(steps.length);
  const cur = steps[player.step] ?? steps[0];
  const meta = dpAlgorithms[algo];

  async function logRun() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Đăng nhập để lưu lịch sử");
    const { error } = await supabase.from("algorithm_history").insert({
      user_id: user.id, algorithm: meta.name, category: "Quy hoạch động",
      input_data: { algo, n, coins, amount },
    });
    if (error) toast.error(error.message); else toast.success("Đã lưu");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="font-serif text-base font-semibold mb-3">Bài toán</h3>
          <div className="space-y-1.5">
            {Object.entries(dpAlgorithms).map(([k, v]) => (
              <button key={k} onClick={() => setAlgo(k as DPKey)} className={`w-full rounded-md px-3 py-2 text-left text-sm ${algo === k ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <div className="font-medium">{v.name}</div>
                <div className={`text-xs font-mono ${algo === k ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{v.complexity}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <h3 className="font-serif text-base font-semibold">Tham số</h3>
          {algo === "fib" && (
            <div>
              <label className="text-xs text-muted-foreground">n = {n}</label>
              <input type="range" min={2} max={15} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full" />
            </div>
          )}
          {algo === "knapsack" && (
            <div>
              <label className="text-xs text-muted-foreground">Sức chứa = {n}</label>
              <input type="range" min={3} max={10} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full" />
              <p className="text-[11px] text-muted-foreground mt-1">Vật phẩm: (w=2,v=3), (3,4), (4,5), (5,6)</p>
            </div>
          )}
          {algo === "lcs" && (
            <>
              <div>
                <label className="text-xs text-muted-foreground">Chuỗi A</label>
                <input value={strA} onChange={(e) => setStrA(e.target.value.toUpperCase().slice(0, 10))} className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm font-mono" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Chuỗi B</label>
                <input value={strB} onChange={(e) => setStrB(e.target.value.toUpperCase().slice(0, 10))} className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm font-mono" />
              </div>
            </>
          )}
          {algo === "coin" && (
            <>
              <div>
                <label className="text-xs text-muted-foreground">Mệnh giá</label>
                <input value={coins} onChange={(e) => setCoins(e.target.value)} className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm font-mono" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Số tiền = {amount}</label>
                <input type="range" min={1} max={20} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full" />
              </div>
            </>
          )}
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

        <div className="rounded-md border border-border bg-card p-4 overflow-x-auto">
          <table className="border-collapse font-mono text-xs">
            {cur.colLabels && (
              <thead>
                <tr>
                  {cur.rowLabels && <th className="p-1.5 border border-border bg-muted/50"></th>}
                  {cur.colLabels.map((c, i) => (
                    <th key={i} className="p-1.5 border border-border bg-muted/50 text-muted-foreground font-normal min-w-[2.5rem]">{c}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {cur.table.map((row, ri) => (
                <tr key={ri}>
                  {cur.rowLabels && (
                    <th className="p-1.5 border border-border bg-muted/50 text-muted-foreground font-normal text-left">{cur.rowLabels[ri]}</th>
                  )}
                  {row.map((cell, ci) => {
                    let cls = "bg-background";
                    if (cell.highlight) cls = "bg-secondary";
                    if (cell.final) cls = "bg-success/20";
                    if (cell.current) cls = "bg-warning text-warning-foreground font-bold";
                    return (
                      <td key={ci} className={`p-1.5 border border-border text-center min-w-[2.5rem] ${cls}`}>{cell.value}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 border-t border-border pt-3 text-sm font-mono min-h-[1.5em]">{cur.description}</div>
        </div>

        <PlayerControls step={player.step} total={steps.length} playing={player.playing} speed={player.speed}
          onPlay={player.play} onPause={player.pause} onPrev={player.prev} onNext={player.next} onReset={player.reset} onSpeed={player.setSpeed} />
      </main>
    </div>
  );
}
