import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { DPVisualizer } from "@/components/visualizers/DPVisualizer";

export const Route = createFileRoute("/dp")({
  head: () => ({
    meta: [
      { title: "Quy hoạch động — Algorithmica" },
      { name: "description", content: "Fibonacci, Knapsack 0/1, LCS, Coin Change qua bảng DP." },
      { property: "og:title", content: "Quy hoạch động — Algorithmica" },
      { property: "og:description", content: "Trực quan hóa các bài toán quy hoạch động kinh điển." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Chương 06</span>
          <h1 className="font-serif text-4xl font-semibold mt-2">Quy hoạch động</h1>
        </div>
        <DPVisualizer />
      </div>
    </div>
  );
}
