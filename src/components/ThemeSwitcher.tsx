import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const THEMES = [
  { id: "nordic", name: "Nordic Indigo", gradient: "linear-gradient(90deg,#4F46E5,#3B82F6)" },
  { id: "sand", name: "Sand & Teal", gradient: "linear-gradient(90deg,#0D9488,#14B8A6)" },
  { id: "charcoal", name: "Charcoal & Lime", gradient: "linear-gradient(90deg,#A3E635,#22C55E)" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<string>("nordic");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const next = saved || "nordic";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  const applyTheme = (id: string) => {
    setTheme(id);
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("theme", id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          aria-label="Change theme"
        >
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => applyTheme(t.id)}
            className={`flex items-center gap-3 cursor-pointer ${
              theme === t.id ? "bg-accent" : ""
            }`}
          >
            <span
              className="inline-block h-5 w-5 rounded-full border border-border shrink-0"
              style={{ background: t.gradient }}
            />
            <span className="text-sm">{t.name}</span>
            {theme === t.id && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
