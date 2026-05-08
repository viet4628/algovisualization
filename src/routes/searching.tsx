import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { SearchingVisualizer } from "@/components/visualizers/SearchingVisualizer";

export const Route = createFileRoute("/searching")({
  head: () => ({
    meta: [
      { title: "Thuật toán tìm kiếm — Algorithmica" },
      { name: "description", content: "Trực quan hóa Linear Search và Binary Search." },
      { property: "og:title", content: "Thuật toán tìm kiếm — Algorithmica" },
      { property: "og:description", content: "Linear và Binary Search animation từng bước." },
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
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Chương 02</span>
          <h1 className="font-serif text-4xl font-semibold mt-2">Thuật toán tìm kiếm</h1>
        </div>
        <SearchingVisualizer />
      </div>
    </div>
  );
}
