import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "contest";
const KEY = "algorithmica-theme";

type Ctx = { theme: Theme; setTheme: (t: Theme) => void; cycle: () => void };
const ThemeCtx = createContext<Ctx | null>(null);

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "contest");
  if (t === "dark") root.classList.add("dark");
  if (t === "contest") root.classList.add("contest");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = (typeof window !== "undefined" ? localStorage.getItem(KEY) : null) as Theme | null;
    const initial: Theme = stored ?? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    try { localStorage.setItem(KEY, t); } catch {}
  };

  const cycle = () => {
    const order: Theme[] = ["light", "dark", "contest"];
    setTheme(order[(order.indexOf(theme) + 1) % order.length]);
  };

  return <ThemeCtx.Provider value={{ theme, setTheme, cycle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
