import { forwardRef, useCallback, useMemo } from "react";
import type { ChangeEvent, FocusEvent, ReactNode } from "react";
import { WcInput } from "@/presentation/modules/shared/components/ui/webcomponents/Inputs/WcInput";
import "./WcNumberInput.css";

export interface WcNumberInputProps {
  id?: string;
  name?: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  unit?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  withSteppers?: boolean;
  size?: "sm" | "md" | "lg";
  prefix?: ReactNode;
  className?: string;
  wrapperClassName?: string;
  ariaLabel?: string;
}

function clamp(value: number, min?: number, max?: number): number {
  let next = value;
  if (typeof min === "number" && next < min) next = min;
  if (typeof max === "number" && next > max) next = max;
  return next;
}

function roundTo(value: number, decimals?: number): number {
  if (typeof decimals !== "number") return value;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export const WcNumberInput = forwardRef<HTMLInputElement, WcNumberInputProps>(
  function WcNumberInput(
    {
      id,
      name,
      value,
      onChange,
      onBlur,
      min,
      max,
      step = 1,
      decimals,
      unit,
      placeholder,
      disabled,
      error,
      withSteppers = false,
      size = "md",
      prefix,
      className,
      wrapperClassName,
      ariaLabel,
    },
    ref,
  ) {
    const inputValue = useMemo(() => {
      if (value === null || value === undefined || Number.isNaN(value)) return "";
      return String(value);
    }, [value]);

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        if (raw === "" || raw === "-") {
          onChange?.(null);
          return;
        }
        const parsed = Number(raw);
        if (Number.isNaN(parsed)) {
          onChange?.(null);
          return;
        }
        onChange?.(roundTo(parsed, decimals));
      },
      [decimals, onChange],
    );

    const adjust = useCallback(
      (delta: number) => {
        const base = typeof value === "number" && !Number.isNaN(value) ? value : 0;
        const next = clamp(roundTo(base + delta, decimals), min, max);
        onChange?.(next);
      },
      [decimals, max, min, onChange, value],
    );

    const suffix = useMemo<ReactNode>(() => {
      const nodes: ReactNode[] = [];
      if (unit) {
        nodes.push(
          <span key="unit" className="wc-number-input__unit">
            {unit}
          </span>,
        );
      }
      if (withSteppers) {
        nodes.push(
          <span key="steppers" className="wc-number-input__steppers">
            <button
              type="button"
              className="wc-number-input__stepper"
              onClick={() => adjust(step)}
              disabled={disabled}
              aria-label="Incrementar"
              tabIndex={-1}
            >
              +
            </button>
            <button
              type="button"
              className="wc-number-input__stepper"
              onClick={() => adjust(-step)}
              disabled={disabled}
              aria-label="Decrementar"
              tabIndex={-1}
            >
              -
            </button>
          </span>,
        );
      }
      if (nodes.length === 0) return null;
      return <>{nodes}</>;
    }, [adjust, disabled, step, unit, withSteppers]);

    return (
      <WcInput
        ref={ref}
        id={id}
        name={name}
        type="number"
        value={inputValue}
        onChange={handleChange}
        onBlur={onBlur}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        size={size}
        prefix={prefix}
        suffix={suffix}
        aria-label={ariaLabel}
        className={className}
        wrapperClassName={
          wrapperClassName ? `wc-number-input ${wrapperClassName}` : "wc-number-input"
        }
      />
    );
  },
);
