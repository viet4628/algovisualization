import { useMemo, useState } from "react";
import { buildBST, layoutTree, treeAlgorithms, type TreeNode } from "@/lib/algorithms/tree";
import { PlayerControls } from "@/components/PlayerControls";
import { usePlayer } from "@/lib/usePlayer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Key = keyof typeof treeAlgorithms;

function flatten(n: TreeNode | null, out: TreeNode[] = []): TreeNode[] {
  if (!n) return out;
  out.push(n);
  flatten(n.left, out);
  flatten(n.right, out);
  return out;
}

export function TreeVisualizer() {
  const [algo, setAlgo] = useState<Key>("inorder");
  const [values, setValues] = useState<number[]>([50, 30, 70, 20, 40, 60, 80, 10, 35]);
  const [input, setInput] = useState("");

  const tree = useMemo(() => {
    const t = buildBST(values);
    if (t) layoutTree(t, 600, 320);
    return t;
  }, [values]);

  const steps = useMemo(() => treeAlgorithms[algo].fn(tree), [algo, tree]);
  const player = usePlayer(steps.length);
  const cur = steps[player.step] ?? steps[0];
  const meta = treeAlgorithms[algo];
  const nodes = flatten(tree);

  function applyInput() {
    const nums = input.split(/[, ]+/).map(Number).filter((n) => !isNaN(n)).slice(0, 15);
    if (nums.length >= 1) setValues(nums); else toast.error("Nhập ít nhất 1 số");
  }

  async function logRun() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Đăng nhập để lưu lịch sử");
    const { error } = await supabase.from("algorithm_history").insert({
      user_id: user.id, algorithm: meta.name, category: "Cây nhị phân",
      input_data: { values },
    });
    if (error) toast.error(error.message); else toast.success("Đã lưu");
  }

  function edges(n: TreeNode | null, acc: { from: TreeNode; to: TreeNode }[] = []) {
    if (!n) return acc;
    if (n.left) { acc.push({ from: n, to: n.left }); edges(n.left, acc); }
    if (n.right) { acc.push({ from: n, to: n.right }); edges(n.right, acc); }
    return acc;
  }
  const allEdges = edges(tree);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="font-serif text-base font-semibold mb-3">Duyệt</h3>
          <div className="space-y-1.5">
            {Object.entries(treeAlgorithms).map(([k, v]) => (
              <button key={k} onClick={() => setAlgo(k as Key)} className={`w-full rounded-md px-3 py-2 text-left text-sm ${algo === k ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <div className="font-medium">{v.name}</div>
                <div className={`text-xs font-mono ${algo === k ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{v.complexity}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <h3 className="font-serif text-base font-semibold">Xây BST</h3>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="vd: 50,30,70,20,40" className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm" />
          <button onClick={applyInput} className="w-full rounded-md bg-secondary py-1.5 text-sm font-medium hover:opacity-90">Tạo cây</button>
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
            {allEdges.map((e, i) => (
              <line key={i} x1={e.from.x ?? 0} y1={e.from.y ?? 0} x2={e.to.x ?? 0} y2={e.to.y ?? 0} stroke="oklch(0.75 0.01 85)" strokeWidth={1.5} />
            ))}
            {nodes.map((n) => {
              const visited = cur.visited.includes(n.value);
              const current = cur.current === n.value;
              const fill = current ? "oklch(0.72 0.15 75)" : visited ? "oklch(0.55 0.14 150)" : "oklch(0.94 0.01 250)";
              const stroke = current ? "oklch(0.55 0.14 35)" : "oklch(0.32 0.08 255)";
              const tc = visited || current ? "oklch(0.98 0 0)" : "oklch(0.20 0.02 250)";
              return (
                <g key={n.id}>
                  <circle cx={n.x ?? 0} cy={n.y ?? 0} r={20} fill={fill} stroke={stroke} strokeWidth={2} />
                  <text x={n.x ?? 0} y={(n.y ?? 0) + 5} fontSize="13" fontWeight="600" fill={tc} textAnchor="middle" className="font-mono">{n.value}</text>
                </g>
              );
            })}
          </svg>
          <div className="mt-2 border-t border-border pt-3 text-sm font-mono min-h-[1.5em]">{cur.description}</div>
          <div className="mt-2 text-xs text-muted-foreground">
            Thứ tự thăm: <span className="font-mono text-foreground">{cur.visited.join(" → ") || "—"}</span>
          </div>
        </div>

        <PlayerControls step={player.step} total={steps.length} playing={player.playing} speed={player.speed}
          onPlay={player.play} onPause={player.pause} onPrev={player.prev} onNext={player.next} onReset={player.reset} onSpeed={player.setSpeed} />
      </main>
    </div>
  );
}
