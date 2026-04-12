import { useEffect, useRef } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcFilterPopover.css";

export type WcFilterValues = Record<string, string>;

export type WcFilterOption = {
  value: string;
  label: string;
};

export type WcFilterField<TValues extends WcFilterValues> = {
  key: keyof TValues;
  id: string;
  label: string;
  options: WcFilterOption[];
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
  closeOnClear?: boolean;
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
    closeOnClear,
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
    if (closeOnClear) {
      onToggle();
    }
  };

  const handleFieldChange = (key: keyof TValues, value: string) => {
    onChange({
      ...values,
      [key]: value,
    });
  };

  return (
    <div className="wc-filter-popover__anchor" ref={anchorRef}>
      <WcButton
        variant={isOpen || activeFiltersCount > 0 ? "primary" : "secondary"}
        className="wc-filter-popover__trigger"
        onClick={onToggle}
      >
        <Icon name={triggerIcon ?? "icon-catalogs"} size={14} />
        {triggerText}
      </WcButton>

      {isOpen ? (
        <div className="wc-filter-popover card">
          <div className="wc-filter-popover__grid">
            {fields.map((field) => (
              <div key={field.id} className="wc-filter-popover__field">
                <label className="wc-filter-popover__label" htmlFor={field.id}>
                  {field.label}
                </label>
                <select
                  id={field.id}
                  className="wc-filter-popover__input"
                  value={values[field.key]}
                  onChange={(event) => handleFieldChange(field.key, event.target.value)}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
