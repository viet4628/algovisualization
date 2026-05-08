import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { LogOut, BookOpen } from "lucide-react";

const navItems = [
  { to: "/sorting", label: "Sắp xếp" },
  { to: "/searching", label: "Tìm kiếm" },
  { to: "/graph", label: "Đồ thị" },
  { to: "/tree", label: "Cây nhị phân" },
];

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-4.5 w-4.5" strokeWidth={2.2} />
          </div>
          <div className="leading-none">
            <div className="font-serif text-lg font-semibold text-foreground">Algorithmica</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Visual Studies</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "px-3 py-2 text-sm font-medium text-foreground border-b-2 border-accent -mb-px" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/history"
                className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground px-3 py-2"
                activeProps={{ className: "hidden sm:inline-flex text-sm text-foreground px-3 py-2" }}
              >
                Lịch sử
              </Link>
              <span className="hidden sm:inline text-xs text-muted-foreground border-l border-border pl-3">
                {user.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
