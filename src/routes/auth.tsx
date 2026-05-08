import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Đăng nhập — Algorithmica" },
      { name: "description", content: "Đăng nhập hoặc tạo tài khoản để lưu lịch sử thuật toán." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { display_name: name || email.split("@")[0] },
        },
      });
      if (error) toast.error(error.message);
      else { toast.success("Tạo tài khoản thành công"); navigate({ to: "/" }); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
      else { toast.success("Đăng nhập thành công"); navigate({ to: "/" }); }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-md border border-border bg-card p-8">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Tài khoản</span>
          <h1 className="font-serif text-3xl font-semibold mt-2 mb-6">
            {mode === "signin" ? "Đăng nhập" : "Tạo tài khoản"}
          </h1>

          <form onSubmit={handle} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs text-muted-foreground">Tên hiển thị</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Mật khẩu</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" />
            </div>
            <button disabled={loading} type="submit" className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {loading ? "Đang xử lý..." : mode === "signin" ? "Đăng nhập" : "Tạo tài khoản"}
            </button>
          </form>

          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground">
            {mode === "signin" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}
