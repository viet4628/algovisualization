import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, Code2, Trophy, Eye, Zap, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const features = [
  { icon: Code2, title: "Online Judge", desc: "Nộp code Python, C++, Java, JavaScript. Chấm tự động qua nhiều test case." },
  { icon: Eye, title: "Visualize từng bước", desc: "Mỗi bài có gợi ý trực quan: xem thuật toán chạy thế nào trước khi code." },
  { icon: Trophy, title: "Contest mode", desc: "Theme tối tương phản cao như Codeforces — sẵn sàng cho thi đấu." },
  { icon: Zap, title: "Phản hồi tức thì", desc: "AC / WA / TLE / RE hiển thị ngay với thời gian và bộ nhớ thực tế." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="border-b border-border academic-grid">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <Reveal className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Online Judge · Visual Studies
            </div>
            <h1 className="mt-6 text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-balance">
              Luyện code, <span className="text-accent">chấm tự động</span>, hiểu thuật toán qua từng bước.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Algorithmica kết hợp một online judge competitive-programming với 37 visualizer thuật toán.
              Giải bài, xem giải thích trực quan, theo dõi tiến trình.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/problems" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90">
                Bắt đầu giải bài <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/learn" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted">
                Khám phá visualizer
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <h2 className="text-3xl font-bold mb-2">Tại sao Algorithmica</h2>
          <p className="text-sm text-muted-foreground">Một nền tảng — luyện thi và học bài bản.</p>
        </Reveal>
        <div className="mt-10 grid gap-px bg-border md:grid-cols-2 border border-border rounded-md overflow-hidden">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="bg-card p-8 h-full">
                <f.icon className="h-6 w-6 text-accent mb-4" strokeWidth={1.8} />
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Reveal>
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Quy trình</span>
            <h2 className="mt-2 text-3xl font-bold">Ba bước để thành thạo</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Chọn bài", d: "15+ bài kinh điển từ easy đến hard, có tag thuật toán." },
              { n: "02", t: "Xem trực quan", d: "Mở tab “Gợi ý trực quan” để hiểu thuật toán liên quan." },
              { n: "03", t: "Submit & chấm", d: "Chạy qua mọi test case, nhận phản hồi chi tiết tức thì." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="rounded-md border border-border bg-card p-6 h-full">
                  <div className="text-xs text-muted-foreground tabular-nums mb-3">{s.n}</div>
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> {s.t}
                  </h3>
                  <p className="text-sm text-muted-foreground">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <Reveal className="rounded-md border border-border bg-card p-10 text-center">
          <h2 className="text-3xl font-bold">Sẵn sàng nộp bài đầu tiên?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tạo tài khoản miễn phí, theo dõi điểm và lịch sử submission.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90">
              Tạo tài khoản
            </Link>
            <Link to="/problems" className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted">
              Xem bài tập
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-8 text-xs text-muted-foreground flex justify-between">
          <span>© Algorithmica · Online Judge</span>
          <span>v2.0</span>
        </div>
      </footer>
    </div>
  );
}
