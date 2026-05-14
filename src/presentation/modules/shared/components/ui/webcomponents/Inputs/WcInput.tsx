import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import "./WcInput.css";

export interface WcInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  error?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: "sm" | "md" | "lg";
  wrapperClassName?: string;
}

export const WcInput = forwardRef<HTMLInputElement, WcInputProps>(
  function WcInput(
    {
      error,
      prefix,
      suffix,
      size = "md",
      className,
      wrapperClassName,
      disabled,
      ...rest
    },
    ref,
  ) {
    const wrapperClasses = ["wc-input"];
    if (wrapperClassName) wrapperClasses.push(wrapperClassName);

    const fieldClasses = ["wc-input__field"];
    if (className) fieldClasses.push(className);

    return (
      <span
        className={wrapperClasses.join(" ")}
        data-size={size}
        data-error={error ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
      >
        {prefix ? <span className="wc-input__affix">{prefix}</span> : null}
        <input
          ref={ref}
          className={fieldClasses.join(" ")}
          disabled={disabled}
          {...rest}
        />
        {suffix ? <span className="wc-input__affix">{suffix}</span> : null}
      </span>
    );
  },
);
