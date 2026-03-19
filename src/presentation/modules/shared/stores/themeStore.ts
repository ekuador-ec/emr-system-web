import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeToDOM(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export const useThemeStore = create<ThemeState>((set) => {
  const initial = getInitialTheme();
  applyThemeToDOM(initial);

  return {
    theme: initial,

    toggleTheme: () =>
      set((state) => {
        const next: Theme = state.theme === "light" ? "dark" : "light";
        applyThemeToDOM(next);
        return { theme: next };
      }),

    setTheme: (theme: Theme) => {
      applyThemeToDOM(theme);
      set({ theme });
    },
  };
});
