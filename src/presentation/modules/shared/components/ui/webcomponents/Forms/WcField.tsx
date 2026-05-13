import type { ReactNode } from "react";
import "./WcField.css";

interface WcFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  spanFull?: boolean;
  className?: string;
  children: ReactNode;
}

export function WcField({
  label,
  htmlFor,
  required,
  hint,
  error,
  spanFull,
  className,
  children,
}: WcFieldProps) {
  const classes = ["wc-field"];
  if (spanFull) classes.push("wc-form-grid__span-full");
  if (className) classes.push(className);

  return (
    <div className={classes.join(" ")}>
      <label className="wc-field__label" htmlFor={htmlFor}>
        <span>{label}</span>
        {required ? (
          <span className="wc-field__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <div className="wc-field__control">{children}</div>
      {error ? (
        <span className="wc-field__error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="wc-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}
