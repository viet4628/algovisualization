import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { TreeVisualizer } from "@/components/visualizers/TreeVisualizer";

export const Route = createFileRoute("/tree")({
  head: () => ({
    meta: [
      { title: "Cây nhị phân — Algorithmica" },
      { name: "description", content: "Trực quan hóa duyệt In-order, Pre-order, Post-order trên BST." },
      { property: "og:title", content: "Cây nhị phân — Algorithmica" },
      { property: "og:description", content: "Duyệt cây nhị phân tìm kiếm từng bước." },
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
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Chương 04</span>
          <h1 className="font-serif text-4xl font-semibold mt-2">Cây nhị phân tìm kiếm</h1>
        </div>
        <TreeVisualizer />
      </div>
    </div>
  );
}
