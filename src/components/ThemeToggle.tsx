import { Sun, Moon, Trophy } from "lucide-react";
import { useTheme, type Theme } from "@/lib/useTheme";

const themes: { key: Theme; icon: typeof Sun; label: string }[] = [
  { key: "light", icon: Sun, label: "Sáng" },
  { key: "dark", icon: Moon, label: "Tối" },
  { key: "contest", icon: Trophy, label: "Thi đấu" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5" role="radiogroup" aria-label="Theme">
      {themes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          role="radio"
          aria-checked={theme === key}
          aria-label={label}
          onClick={() => setTheme(key)}
          className={`inline-flex h-7 w-7 items-center justify-center rounded transition-colors ${
            theme === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          title={label}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
