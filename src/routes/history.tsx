import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Lịch sử — Algorithmica" }] }),
  component: History,
});

type Row = {
  id: string;
  algorithm: string;
  category: string;
  created_at: string;
  input_data: unknown;
};

function History() {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("algorithm_history").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) toast.error(error.message);
      else setRows((data ?? []) as Row[]);
    });
  }, [user]);

  async function remove(id: string) {
    const { error } = await supabase.from("algorithm_history").delete().eq("id", id);
    if (error) toast.error(error.message);
    else setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Sổ ghi chép</span>
          <h1 className="font-serif text-4xl font-semibold mt-2">Lịch sử thuật toán</h1>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Đang tải...</p>
        ) : !user ? (
          <div className="rounded-md border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground mb-4">Hãy đăng nhập để xem lịch sử của bạn.</p>
            <Link to="/auth" className="inline-flex rounded-md bg-primary px-5 py-2 text-sm text-primary-foreground">Đăng nhập</Link>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-md border border-border bg-card p-8 text-center text-muted-foreground">
            Chưa có lịch sử. Hãy chạy một thuật toán và bấm "Lưu vào lịch sử".
          </div>
        ) : (
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Thuật toán</th>
                  <th className="px-4 py-3">Chương</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{r.algorithm}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(r.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
