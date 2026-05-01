import type { HTMLAttributes, ReactNode } from "react";
import "@/presentation/modules/shared/components/ui/webcomponents/Tags/wcTag.css";

type TagVariant =
  | "neutral"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "accent";
type TagSize = "sm" | "md";

interface WcTagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  size?: TagSize;
  children: ReactNode;
}

function WcTag(props: WcTagProps) {
  const {
    variant = "neutral",
    size = "md",
    className,
    children,
    ...restProps
  } = props;

  const composedClassName = [
    "wc-tag",
    variant !== "neutral" ? `is-${variant}` : "",
    size === "sm" ? "is-sm" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={composedClassName} {...restProps}>
      {children}
    </span>
  );
}

export default WcTag;
