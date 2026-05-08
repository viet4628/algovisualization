import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { StringVisualizer } from "@/components/visualizers/StringVisualizer";

export const Route = createFileRoute("/string")({
  head: () => ({
    meta: [
      { title: "Khớp chuỗi — Algorithmica" },
      { name: "description", content: "Trực quan hóa Naive, KMP, Rabin-Karp khớp pattern trong text." },
      { property: "og:title", content: "Khớp chuỗi — Algorithmica" },
      { property: "og:description", content: "Naive, KMP, Rabin-Karp animation từng bước." },
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
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Chương 05</span>
          <h1 className="font-serif text-4xl font-semibold mt-2">Khớp chuỗi</h1>
        </div>
        <StringVisualizer />
      </div>
    </div>
  );
}
