import { useThemeStore } from "@/presentation/modules/shared/stores/themeStore";

const LIGHT_PALETTE = [
  "#0041f5",
  "#0d9488",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0ea5e9",
  "#db2777",
  "#65a30d",
];

const DARK_PALETTE = [
  "#60a5fa",
  "#2dd4bf",
  "#fbbf24",
  "#f87171",
  "#a78bfa",
  "#38bdf8",
  "#f472b6",
  "#a3e635",
];

export function chartPalette(): string[] {
  try {
    const theme = useThemeStore.getState().theme;
    return theme === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
  } catch {
    return LIGHT_PALETTE;
  }
}

export function chartColorAt(index: number): string {
  const palette = chartPalette();
  return palette[index % palette.length];
}
