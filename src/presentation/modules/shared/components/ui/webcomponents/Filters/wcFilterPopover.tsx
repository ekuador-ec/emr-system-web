import { useEffect, useRef } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcFilterPopover.css";

export type WcFilterValues = Record<string, string | string[]>;

export type WcFilterOption = {
  value: string;
  label: string;
};

export type WcFilterField<TValues extends WcFilterValues> = {
  key: keyof TValues;
  id: string;
  label: string;
  options: WcFilterOption[];
  multiSelect?: boolean;
};

type WcFilterPopoverProps<TValues extends WcFilterValues> = {
  isOpen: boolean;
  activeFiltersCount: number;
  values: TValues;
  fields: Array<WcFilterField<TValues>>;
  onToggle: () => void;
  onChange: (next: TValues) => void;
  onClear: () => void;
  onApply: () => void;
  triggerLabel?: string;
  triggerIcon?: string;
  clearLabel?: string;
  applyLabel?: string;
  align?: "left" | "right";
};

export function WcFilterPopover<TValues extends WcFilterValues>(
  props: WcFilterPopoverProps<TValues>,
) {
  const {
    isOpen,
    activeFiltersCount,
    values,
    fields,
    onToggle,
    onChange,
    onClear,
    onApply,
    triggerLabel,
    triggerIcon,
    clearLabel,
    applyLabel,
    align = "left",
  } = props;
  const anchorRef = useRef<HTMLDivElement>(null);
  const resolvedTriggerLabel = triggerLabel ?? "Filter";
  const triggerText =
    activeFiltersCount > 0
      ? `${resolvedTriggerLabel} (${activeFiltersCount})`
      : resolvedTriggerLabel;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDownOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (anchorRef.current?.contains(target)) {
        return;
      }

      onToggle();
    };

    document.addEventListener("mousedown", handlePointerDownOutside);

    return () => {
      document.removeEventListener("mousedown", handlePointerDownOutside);
    };
  }, [isOpen, onToggle]);

  const handleClear = () => {
    onClear();
  };

  const handleFieldChange = (key: keyof TValues, value: string) => {
    onChange({
      ...values,
      [key]: value,
    });
  };

  const handleMultiSelectToggle = (key: keyof TValues, optionValue: string) => {
    const currentArray = (values[key] as string[]) ?? [];
    const nextArray = currentArray.includes(optionValue)
      ? currentArray.filter((v) => v !== optionValue)
      : [...currentArray, optionValue];

    onChange({
      ...values,
      [key]: nextArray,
    });
  };

  return (
    <div className="wc-filter-popover__anchor" ref={anchorRef}>
      <WcButton
        variant={isOpen || activeFiltersCount > 0 ? "primary" : "secondary"}
        className="wc-filter-popover__trigger"
        onClick={onToggle}
      >
        <Icon name={triggerIcon ?? "icon-filters"} size={14} />
        {triggerText}
      </WcButton>

      {isOpen ? (
        <div className={`wc-filter-popover card wc-filter-popover--align-${align}`}>
          <div className="wc-filter-popover__grid">
            {fields.map((field) => (
              <div key={field.id} className="wc-filter-popover__field">
                <label className="wc-filter-popover__label" htmlFor={field.id}>
                  {field.label}
                </label>
                {field.multiSelect ? (
                  <div
                    className="wc-filter-popover__multi-options"
                    role="group"
                    aria-labelledby={field.id}
                  >
                    {field.options.map((option) => {
                      const checked = ((values[field.key] as string[]) ?? []).includes(
                        option.value,
                      );
                      const inputId = `${field.id}--${option.value}`;
                      return (
                        <label
                          key={option.value}
                          className={`wc-filter-popover__chip${checked ? " is-checked" : ""}`}
                          htmlFor={inputId}
                        >
                          <input
                            id={inputId}
                            type="checkbox"
                            className="wc-filter-popover__chip-input"
                            checked={checked}
                            onChange={() =>
                              handleMultiSelectToggle(field.key, option.value)
                            }
                          />
                          <span className="wc-filter-popover__chip-label">
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <select
                    id={field.id}
                    className="wc-filter-popover__input"
                    value={values[field.key] as string}
                    onChange={(event) => handleFieldChange(field.key, event.target.value)}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          <div className="wc-filter-popover__actions">
            <WcButton variant="secondary" onClick={handleClear}>
              {clearLabel ?? "Limpiar"}
            </WcButton>
            <WcButton variant="primary" onClick={onApply}>
              {applyLabel ?? "Aplicar"}
            </WcButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
