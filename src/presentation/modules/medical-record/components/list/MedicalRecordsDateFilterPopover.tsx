import { useEffect, useRef } from "react";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import {
  formatMedicalRecordDateRange,
  type MedicalRecordDateRange,
} from "@/presentation/modules/medical-record/utils/dateRange";

interface MedicalRecordsDateFilterPopoverProps {
  isOpen: boolean;
  onToggle: () => void;
  startDate: string;
  endDate: string;
  activeFiltersCount: number;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  onPresetRange: (range: MedicalRecordDateRange) => void;
}

const presetOptions: Array<{ label: string; daysBack: number }> = [
  { label: "Últimos 2 días", daysBack: 1 },
  { label: "Últimos 7 días", daysBack: 6 },
  { label: "Últimos 31 días", daysBack: 30 },
];

function toLocalDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPresetRange(daysBack: number): MedicalRecordDateRange {
  const endDate = new Date();
  const startDate = new Date();

  startDate.setDate(endDate.getDate() - daysBack);

  return {
    startDate: toLocalDateInputValue(startDate),
    endDate: toLocalDateInputValue(endDate),
  };
}

export function MedicalRecordsDateFilterPopover({
  isOpen,
  onToggle,
  startDate,
  endDate,
  activeFiltersCount,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onClear,
  onPresetRange,
}: MedicalRecordsDateFilterPopoverProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const hasActiveRange = Boolean(startDate && endDate);

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

  const activeRangeLabel = hasActiveRange
    ? formatMedicalRecordDateRange({ startDate, endDate })
    : "Usando el rango reciente por defecto";

  const handlePresetClick = (daysBack: number) => {
    onPresetRange(getPresetRange(daysBack));
  };

  return (
    <div ref={anchorRef} style={{ position: "relative" }}>
      <WcButton
        variant={isOpen || activeFiltersCount > 0 || hasActiveRange ? "primary" : "secondary"}
        onClick={onToggle}
        style={{ minWidth: "220px", justifyContent: "center" }}
      >
        <Icon name="icon-calendar" size={16} />
        Filtrar por fecha
      </WcButton>

      {isOpen ? (
        <div
          className="card"
          style={{
            position: "absolute",
            top: "calc(100% + var(--space-2))",
            right: 0,
            width: "min(420px, calc(100vw - 24px))",
            zIndex: 20,
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
              <span
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Rango de edición
              </span>
              <span
                style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}
              >
                Los resultados se ordenan por la última edición registrada.
              </span>
            </div>
            <WcButtonIcon
              variant="ghost"
              icon="icon-x"
              title="Cerrar"
              onClick={onToggle}
              aria-label="Cerrar filtros de fecha"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "var(--space-2)",
            }}
          >
            {presetOptions.map((preset) => (
              <WcButton
                key={preset.label}
                variant="secondary"
                onClick={() => handlePresetClick(preset.daysBack)}
                style={{
                  minHeight: "42px",
                  paddingInline: "var(--space-3)",
                  justifyContent: "center",
                  fontSize: "var(--font-size-xs)",
                }}
              >
                {preset.label}
              </WcButton>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
              <label
                style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}
              >
                Desde
              </label>
              <input
                type="date"
                className="input-field"
                style={{ padding: "var(--space-2)" }}
                value={startDate}
                onChange={(event) => onStartDateChange(event.target.value)}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
              <label
                style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}
              >
                Hasta
              </label>
              <input
                type="date"
                className="input-field"
                style={{ padding: "var(--space-2)" }}
                value={endDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(event) => onEndDateChange(event.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <Icon name="icon-info-circle" size={16} />
            <span>{activeRangeLabel}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)" }}>
            <WcButton variant="secondary" onClick={onClear}>
              Limpiar
            </WcButton>
            <WcButton variant="primary" onClick={onApply}>
              Aplicar rango
            </WcButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
