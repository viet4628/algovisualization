import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { SortingVisualizer } from "@/components/visualizers/SortingVisualizer";

export const Route = createFileRoute("/sorting")({
  head: () => ({
    meta: [
      { title: "Thuật toán sắp xếp — Algorithmica" },
      { name: "description", content: "Trực quan hóa Bubble, Selection, Insertion, Quick và Merge Sort từng bước." },
      { property: "og:title", content: "Thuật toán sắp xếp — Algorithmica" },
      { property: "og:description", content: "Bubble, Quick, Merge Sort... animation từng bước." },
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
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Chương 01</span>
          <h1 className="font-serif text-4xl font-semibold mt-2">Thuật toán sắp xếp</h1>
        </div>
        <SortingVisualizer />
      </div>
    </div>
  );
}
