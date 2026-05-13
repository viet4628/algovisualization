import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, BarChart3, Search, Network, GitBranch, Type, Table2 } from "lucide-react";

const topics = [
  { to: "/sorting", icon: BarChart3, title: "Sắp xếp", desc: "Bubble, Quick, Merge, Heap, Radix...", count: "11 thuật toán" },
  { to: "/searching", icon: Search, title: "Tìm kiếm", desc: "Linear, Binary, Jump, Interpolation...", count: "6 thuật toán" },
  { to: "/graph", icon: Network, title: "Đồ thị", desc: "BFS, DFS, Dijkstra, Bellman-Ford, MST...", count: "7 thuật toán" },
  { to: "/tree", icon: GitBranch, title: "Cây nhị phân", desc: "Traversal, BST...", count: "6 thuật toán" },
  { to: "/string", icon: Type, title: "Khớp chuỗi", desc: "Naive, KMP, Rabin-Karp", count: "3 thuật toán" },
  { to: "/dp", icon: Table2, title: "Quy hoạch động", desc: "Fibonacci, Knapsack, LCS, Coin Change", count: "4 bài toán" },
] as const;

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Học tập — Algorithmica" },
      { name: "description", content: "Trực quan hoá thuật toán theo từng bước." },
      { property: "og:title", content: "Học tập — Algorithmica" },
      { property: "og:description", content: "Visualize sorting, graph, DP, string, BST." },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Reveal>
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Visual Studies</span>
          <h1 className="mt-2 text-4xl font-bold">Học tập trực quan</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">37 thuật toán kinh điển — điều khiển từng bước, xem được trạng thái mảng/đồ thị/cây ở mọi thời điểm.</p>
        </Reveal>

        <div className="mt-10 grid gap-px bg-border md:grid-cols-2 border border-border rounded-md overflow-hidden">
          {topics.map((t, i) => (
            <Reveal key={t.to} delay={i * 60}>
              <Link to={t.to} className="group block bg-card p-8 hover:bg-muted/50 transition-colors h-full">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <t.icon className="h-5 w-5 text-accent" strokeWidth={1.8} />
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">{t.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{t.desc}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wider text-muted-foreground">{t.count}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
