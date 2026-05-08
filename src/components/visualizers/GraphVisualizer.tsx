import { useMemo, useState } from "react";
import { graphAlgorithms, sampleGraph } from "@/lib/algorithms/graph";
import { PlayerControls } from "@/components/PlayerControls";
import { usePlayer } from "@/lib/usePlayer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Key = keyof typeof graphAlgorithms;

export function GraphVisualizer() {
  const [algo, setAlgo] = useState<Key>("bfs");
  const [start, setStart] = useState("A");
  const g = sampleGraph;
  const steps = useMemo(() => graphAlgorithms[algo].fn(g, start), [algo, start, g]);
  const player = usePlayer(steps.length);
  const cur = steps[player.step] ?? steps[0];
  const meta = graphAlgorithms[algo];

  async function logRun() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Đăng nhập để lưu lịch sử");
    const { error } = await supabase.from("algorithm_history").insert({
      user_id: user.id, algorithm: meta.name, category: "Đồ thị",
      input_data: { start },
    });
    if (error) toast.error(error.message); else toast.success("Đã lưu");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="font-serif text-base font-semibold mb-3">Thuật toán</h3>
          <div className="space-y-1.5">
            {Object.entries(graphAlgorithms).map(([k, v]) => (
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
            <label className="text-xs text-muted-foreground">Đỉnh xuất phát</label>
            <select value={start} onChange={(e) => setStart(e.target.value)} className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm">
              {g.nodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
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

        <div className="rounded-md border border-border bg-card p-4">
          <svg viewBox="0 0 640 360" className="w-full h-auto">
            {g.edges.map((e, i) => {
              const a = g.nodes.find((n) => n.id === e.from)!;
              const b = g.nodes.find((n) => n.id === e.to)!;
              const active = cur.edge && ((cur.edge[0] === e.from && cur.edge[1] === e.to) || (cur.edge[0] === e.to && cur.edge[1] === e.from));
              const inMst = cur.mstEdges?.some(([f, t]) => (f === e.from && t === e.to) || (f === e.to && t === e.from));
              const stroke = inMst ? "oklch(0.55 0.14 150)" : active ? "oklch(0.55 0.14 35)" : "oklch(0.75 0.01 85)";
              const sw = inMst || active ? 3 : 1.5;
              return (
                <g key={i}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={sw} />
                  <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 6} fontSize="11" fill="oklch(0.45 0.02 250)" textAnchor="middle" className="font-mono">{e.weight}</text>
                </g>
              );
            })}
            {g.nodes.map((n) => {
              const visited = cur.visited.includes(n.id);
              const current = cur.current === n.id;
              const fill = current ? "oklch(0.72 0.15 75)" : visited ? "oklch(0.55 0.14 150)" : "oklch(0.94 0.01 250)";
              const stroke = current ? "oklch(0.55 0.14 35)" : "oklch(0.32 0.08 255)";
              const tc = visited || current ? "oklch(0.98 0 0)" : "oklch(0.20 0.02 250)";
              return (
                <g key={n.id}>
                  <circle cx={n.x} cy={n.y} r={22} fill={fill} stroke={stroke} strokeWidth={2} />
                  <text x={n.x} y={n.y + 5} fontSize="14" fontWeight="600" fill={tc} textAnchor="middle" className="font-serif">{n.id}</text>
                  {cur.distances && cur.distances[n.id] !== undefined && (
                    <text x={n.x} y={n.y - 30} fontSize="10" fill="oklch(0.32 0.08 255)" textAnchor="middle" className="font-mono">
                      d={cur.distances[n.id] === Infinity ? "∞" : cur.distances[n.id]}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="mt-2 border-t border-border pt-3 text-sm font-mono min-h-[1.5em]">{cur.description}</div>
        </div>

        <PlayerControls step={player.step} total={steps.length} playing={player.playing} speed={player.speed}
          onPlay={player.play} onPause={player.pause} onPrev={player.prev} onNext={player.next} onReset={player.reset} onSpeed={player.setSpeed} />
      </main>
    </div>
  );
}
