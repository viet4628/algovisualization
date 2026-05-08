import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { GraphVisualizer } from "@/components/visualizers/GraphVisualizer";

export const Route = createFileRoute("/graph")({
  head: () => ({
    meta: [
      { title: "Thuật toán đồ thị — Algorithmica" },
      { name: "description", content: "Trực quan hóa BFS, DFS và Dijkstra trên đồ thị có trọng số." },
      { property: "og:title", content: "Thuật toán đồ thị — Algorithmica" },
      { property: "og:description", content: "BFS, DFS, Dijkstra animation từng bước." },
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
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Chương 03</span>
          <h1 className="font-serif text-4xl font-semibold mt-2">Thuật toán đồ thị</h1>
        </div>
        <GraphVisualizer />
      </div>
    </div>
  );
}
