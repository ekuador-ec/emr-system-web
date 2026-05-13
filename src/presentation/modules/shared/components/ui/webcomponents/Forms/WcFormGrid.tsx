import type { CSSProperties, ReactNode } from "react";
import "./WcFormGrid.css";

interface WcFormGridProps {
  columns?: 1 | 2 | 3 | 4;
  min?: string;
  gap?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}

export function WcFormGrid({
  columns = 2,
  min = "220px",
  gap = "md",
  children,
  className,
}: WcFormGridProps) {
  const rootClassName = className ? `wc-form-grid ${className}` : "wc-form-grid";
  const style = { "--wc-grid-min": min } as CSSProperties;

  return (
    <div
      className={rootClassName}
      data-columns={columns}
      data-gap={gap}
      style={style}
    >
      {children}
    </div>
  );
}
