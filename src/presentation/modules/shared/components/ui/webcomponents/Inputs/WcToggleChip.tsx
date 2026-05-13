import type { ReactNode } from "react";
import "./WcToggleChip.css";

export interface WcToggleChipOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface WcToggleChipProps {
  value: string | null;
  onChange: (value: string) => void;
  options: WcToggleChipOption[];
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}

export function WcToggleChip({
  value,
  onChange,
  options,
  size = "md",
  className,
  ariaLabel,
}: WcToggleChipProps) {
  const classes = ["wc-toggle-chip"];
  if (className) classes.push(className);

  return (
    <div
      className={classes.join(" ")}
      data-size={size}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={option.disabled}
            className="wc-toggle-chip__option"
            data-active={isActive ? "true" : undefined}
            onClick={() => onChange(option.value)}
          >
            {option.icon ? (
              <span className="wc-toggle-chip__icon" aria-hidden="true">
                {option.icon}
              </span>
            ) : null}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
