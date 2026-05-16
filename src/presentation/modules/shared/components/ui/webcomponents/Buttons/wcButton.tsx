import { Children } from "react";
import type { ButtonHTMLAttributes } from "react";
import "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton.css";

type ButtonVariant = "primary" | "secondary" | "danger" | "terciary" | "success";

interface WcButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

function WcButton(props: WcButtonProps) {
  const { variant = "primary", className, children, type, ...restProps } = props;
  const composedClassName = `wc-button is-${variant} ${className ?? ""}`.trim();
  const normalizedContent = Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return <span className="wc-button__label">{child}</span>;
    }

    return child;
  });

  return (
    <button
      type={type ?? "button"}
      className={composedClassName}
      {...restProps}
    >
      {normalizedContent}
    </button>
  );
}

export default WcButton;
