import type { ReactNode } from "react";

interface EvolutionPdfGridProps {
  columns?: number;
  children: ReactNode;
  className?: string;
}

export function EvolutionPdfGrid({
  columns = 12,
  children,
  className,
}: EvolutionPdfGridProps) {
  const classes = ["em-pdf-grid", className || ""].filter(Boolean).join(" ");
  const style = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  };
  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
