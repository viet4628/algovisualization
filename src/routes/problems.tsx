import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Tag } from "lucide-react";

type Problem = {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  tags: string[];
  related_algo: string | null;
};

export const Route = createFileRoute("/problems")({
  head: () => ({
    meta: [
      { title: "Bài tập — Algorithmica Judge" },
      { name: "description", content: "Danh sách bài tập lập trình thi đấu, chấm tự động." },
      { property: "og:title", content: "Bài tập — Algorithmica Judge" },
      { property: "og:description", content: "Luyện thi competitive programming với online judge." },
    ],
  }),
  component: ProblemsPage,
});

const DIFF_COLOR: Record<string, string> = {
  easy: "text-success border-success/40 bg-success/10",
  medium: "text-warning border-warning/40 bg-warning/10",
  hard: "text-destructive border-destructive/40 bg-destructive/10",
};

function ProblemsPage() {
  const [items, setItems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("problems").select("id,slug,title,difficulty,tags,related_algo").order("created_at", { ascending: true })
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, []);

  const filtered = items.filter((p) => {
    if (filter !== "all" && p.difficulty !== filter) return false;
    if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Reveal>
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Online Judge</span>
          <h1 className="mt-2 text-4xl font-bold">Bài tập</h1>
          <p className="mt-2 text-sm text-muted-foreground">Nộp code · chấm tự động qua nhiều test case · hỗ trợ Python, C++, Java, JavaScript.</p>
        </Reveal>

        <Reveal delay={80} className="mt-6 flex flex-wrap items-center gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên..."
            className="flex-1 min-w-60 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <div className="inline-flex rounded-md border border-border bg-card p-0.5">
            {["all", "easy", "medium", "hard"].map((d) => (
              <button key={d} onClick={() => setFilter(d)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider rounded ${filter === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {d === "all" ? "Tất cả" : d}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 space-y-3">
          {loading && <div className="text-sm text-muted-foreground">Đang tải...</div>}
          {!loading && filtered.length === 0 && <div className="text-sm text-muted-foreground">Không có bài.</div>}
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={i * 40}>
              <Link to="/problems/$slug" params={{ slug: p.slug }}
                className="group flex items-center gap-4 rounded-md border border-border bg-card p-5 hover:bg-muted/40 transition-colors">
                <span className="text-xs font-bold tabular-nums text-muted-foreground w-8">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold group-hover:text-accent transition-colors">{p.title}</h3>
                    <span className={`text-[10px] uppercase tracking-wider border px-1.5 py-0.5 rounded ${DIFF_COLOR[p.difficulty] ?? ""}`}>{p.difficulty}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    {p.tags.slice(0, 4).map((t) => (
                      <span key={t} className="inline-flex items-center gap-1"><Tag className="h-3 w-3" />{t}</span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
