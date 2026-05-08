import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { ArrowRight, BarChart3, Search, Network, GitBranch, Type, Table2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const topics = [
  { to: "/sorting", icon: BarChart3, title: "Sắp xếp", desc: "Bubble, Selection, Insertion, Quick, Merge, Heap, Shell, Cocktail, Gnome, Counting, Radix", count: "11 thuật toán" },
  { to: "/searching", icon: Search, title: "Tìm kiếm", desc: "Linear, Binary, Jump, Interpolation, Exponential, Ternary", count: "6 thuật toán" },
  { to: "/graph", icon: Network, title: "Đồ thị", desc: "BFS, DFS, Dijkstra, Bellman-Ford, Prim, Kruskal, Topological Sort", count: "7 thuật toán" },
  { to: "/tree", icon: GitBranch, title: "Cây nhị phân", desc: "In/Pre/Post-order, Level-order, BST Search, BST Insert", count: "6 thuật toán" },
  { to: "/string", icon: Type, title: "Khớp chuỗi", desc: "Naive, KMP, Rabin-Karp", count: "3 thuật toán" },
  { to: "/dp", icon: Table2, title: "Quy hoạch động", desc: "Fibonacci, 0/1 Knapsack, LCS, Coin Change", count: "4 bài toán" },
] as const;

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="border-b border-border academic-grid">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Visual Studies in Computer Science
            </div>
            <h1 className="mt-6 font-serif text-5xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-foreground text-balance">
              Hiểu thuật toán <span className="italic text-accent">qua từng bước</span>, không qua trang sách.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Algorithmica trực quan hóa các thuật toán kinh điển — từ sắp xếp đến đồ thị —
              với điều khiển từng bước, lưu lịch sử và giải thích trực tiếp ở mọi giai đoạn.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/sorting" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                Bắt đầu khám phá <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted">
                Tạo tài khoản
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-serif text-3xl font-semibold">Chủ đề</h2>
          <span className="text-sm text-muted-foreground font-mono">06 / chương</span>
        </div>
        <div className="grid gap-px bg-border md:grid-cols-2 border border-border rounded-md overflow-hidden">
          {topics.map((t, i) => (
            <Link key={t.to} to={t.to} className="group bg-card p-8 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <t.icon className="h-5 w-5 text-accent" strokeWidth={1.8} />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-2 group-hover:text-accent transition-colors">{t.title}</h3>
              <p className="text-sm text-muted-foreground mb-6">{t.desc}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase tracking-wider text-muted-foreground">{t.count}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-8 text-xs text-muted-foreground flex justify-between">
          <span>© Algorithmica · Visual Studies</span>
          <span className="font-mono">v1.0</span>
        </div>
      </footer>
    </div>
  );
}
