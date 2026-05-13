import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { LogOut, Code2, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { to: "/problems", label: "Bài tập" },
  { to: "/learn", label: "Học tập" },
  { to: "/history", label: "Lịch sử" },
];

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Code2 className="h-4.5 w-4.5" strokeWidth={2.4} />
          </div>
          <div className="leading-none">
            <div className="text-lg font-bold tracking-tight">Algorithmica</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Judge · Visualize</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "px-3 py-2 text-sm font-medium text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden lg:inline text-xs text-muted-foreground border-l border-border pl-3 ml-1">
                {user.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
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
          <button onClick={() => setOpen((v) => !v)} className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md border border-border" aria-label="menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t border-border bg-background px-6 py-3 flex flex-col gap-1">
          {navItems.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-2 py-2 text-sm hover:bg-muted rounded">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
