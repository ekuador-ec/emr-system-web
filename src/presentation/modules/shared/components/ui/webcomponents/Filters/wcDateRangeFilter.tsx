import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcDateRangeFilter.css";

export interface WcDateRangePreset {
  label: string;
  daysBack: number;
}

export interface WcDateRange {
  startDate: string;
  endDate: string;
}

interface WcDateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onApplyPreset: (range: WcDateRange) => void;
  presets?: WcDateRangePreset[];
  title?: string;
  icon?: string;
  startLabel?: string;
  endLabel?: string;
  presetsLabel?: string;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_PRESETS: WcDateRangePreset[] = [
  { label: "Últimos 7 días", daysBack: 6 },
  { label: "Últimos 15 días", daysBack: 14 },
  { label: "Últimos 31 días", daysBack: 30 },
];

function toLocalDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildDateRangeFromPreset(daysBack: number): WcDateRange {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - daysBack);
  return {
    startDate: toLocalDateInputValue(startDate),
    endDate: toLocalDateInputValue(endDate),
  };
}

export function WcDateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApplyPreset,
  presets = DEFAULT_PRESETS,
  title = "Periodo",
  icon = "icon-calendar",
  startLabel = "Desde",
  endLabel = "Hasta",
  presetsLabel = "Acceso rápido:",
  disabled = false,
  className,
}: WcDateRangeFilterProps) {
  const handlePresetClick = (daysBack: number) => {
    const range = buildDateRangeFromPreset(daysBack);
    onApplyPreset(range);
  };

  const wrapperClassName = ["card", "wc-date-range-filter", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClassName}>
      <div className="wc-date-range-filter__title">
        <Icon name={icon} size={16} />
        <span className="wc-date-range-filter__title-label">{title}</span>
      </div>

      <div className="wc-date-range-filter__inputs">
        <div className="wc-date-range-filter__field">
          <label className="wc-date-range-filter__field-label">{startLabel}</label>
          <input
            type="date"
            className="input-field wc-date-range-filter__field-input"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            max={endDate || undefined}
            disabled={disabled}
          />
        </div>
        <div className="wc-date-range-filter__field">
          <label className="wc-date-range-filter__field-label">{endLabel}</label>
          <input
            type="date"
            className="input-field wc-date-range-filter__field-input"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            min={startDate || undefined}
            disabled={disabled}
          />
        </div>
      </div>

      {presets.length > 0 && (
        <div className="wc-date-range-filter__presets">
          <span className="wc-date-range-filter__presets-label">{presetsLabel}</span>
          {presets.map((preset) => (
            <WcButton
              key={preset.label}
              variant="terciary"
              onClick={() => handlePresetClick(preset.daysBack)}
              disabled={disabled}
            >
              {preset.label}
            </WcButton>
          ))}
        </div>
      )}
    </div>
  );
}
