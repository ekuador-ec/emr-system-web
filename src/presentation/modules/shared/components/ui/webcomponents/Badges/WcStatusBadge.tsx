import type { ReactNode } from "react";
import "./WcStatusBadge.css";

export type WcStatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export interface WcStatusBadgeProps {
  variant: WcStatusVariant;
  children: ReactNode;
  icon?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function WcStatusBadge({
  variant,
  children,
  icon,
  size = "md",
  className,
}: WcStatusBadgeProps) {
  const classes = ["wc-status-badge"];
  if (className) classes.push(className);

  return (
    <span
      className={classes.join(" ")}
      data-variant={variant}
      data-size={size}
    >
      {icon ? (
        <span className="wc-status-badge__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </span>
  );
}
