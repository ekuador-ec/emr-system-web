import type { ButtonHTMLAttributes, ReactNode } from "react";
import "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon.css";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "terciary"
  | "success";
type ButtonShape = "square" | "circle";
type ButtonSize = "sm" | "md" | "lg";

const defaultVariant: ButtonVariant = "primary";
const defaultShape: ButtonShape = "square";
const defaultSize: ButtonSize = "md";

interface WcButtonIconProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
}

function WcButtonIcon(props: WcButtonIconProps) {
  const {
    icon,
    variant = defaultVariant,
    shape = defaultShape,
    size = defaultSize,
    className,
    children,
    type,
    ...restProps
  } = props;
  const composedClassName = `wc-button-icon is-${variant} is-${shape} is-${size} ${className ?? ""}`.trim();

  return (
    <button
      type={type ?? "button"}
      className={composedClassName}
      data-variant={variant}
      data-shape={shape}
      data-size={size}
      {...restProps}
    >
      {icon ? (
        <svg aria-hidden="true">
          <use href={`/icons/system-icons.svg?v=1.0.1#${icon}`} xlinkHref={`/icons/system-icons.svg?v=1.0.1#${icon}`} />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}

export default WcButtonIcon;
