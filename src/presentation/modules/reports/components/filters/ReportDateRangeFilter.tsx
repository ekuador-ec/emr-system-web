import { useMemo } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import type { ReportGranularity } from "@/domain/modules/reports/models/ReportRange";
import {
  PRESET_LABELS,
  formatHumanDate,
  rangeDays,
  type DateRangePreset,
  type DateRangeValue,
} from "../../utils/dateRange";
import "./ReportDateRangeFilter.css";

const DEFAULT_PRESETS: DateRangePreset[] = [
  "today",
  "yesterday",
  "last7",
  "last30",
  "mtd",
  "lastMonth",
  "ytd",
  "custom",
];

const DEFAULT_MAX_DAYS = 90;

interface ReportDateRangeFilterProps {
  preset: DateRangePreset;
  range: DateRangeValue;
  granularity: ReportGranularity;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomRangeChange: (range: DateRangeValue) => void;
  onGranularityChange: (granularity: ReportGranularity) => void;
  showGranularity?: boolean;
  presets?: DateRangePreset[];
  maxDays?: number;
  title?: string;
}

export function ReportDateRangeFilter({
  preset,
  range,
  granularity,
  onPresetChange,
  onCustomRangeChange,
  onGranularityChange,
  showGranularity = true,
  presets = DEFAULT_PRESETS,
  maxDays = DEFAULT_MAX_DAYS,
  title = "Periodo del reporte",
}: ReportDateRangeFilterProps) {
  const days = useMemo(() => rangeDays(range), [range]);
  const error = useMemo(() => {
    if (!range.from || !range.to) return null;
    if (new Date(range.from).getTime() > new Date(range.to).getTime()) {
      return "La fecha inicial no puede ser mayor a la final.";
    }
    if (days > maxDays) {
      return `El rango no puede superar ${maxDays} dias.`;
    }
    return null;
  }, [range, days, maxDays]);

  const handleFromChange = (value: string) => {
    onCustomRangeChange({ from: value, to: range.to });
  };

  const handleToChange = (value: string) => {
    onCustomRangeChange({ from: range.from, to: value });
  };

  const handlePresetClick = (next: DateRangePreset) => {
    onPresetChange(next);
  };

  return (
    <div className="report-range-filter">
      <div className="report-range-filter__title">
        <Icon name="icon-calendar" size={16} />
        <span>{title}</span>
      </div>

      <div className="report-range-filter__presets" role="tablist">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            className={`report-range-filter__preset${preset === p ? " is-active" : ""}`}
            onClick={() => handlePresetClick(p)}
            role="tab"
            aria-selected={preset === p}
          >
            {PRESET_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="report-range-filter__row">
        <div className="report-range-filter__custom">
          <div className="report-range-filter__field">
            <label className="report-range-filter__field-label">Desde</label>
            <input
              type="date"
              className="report-range-filter__field-input"
              value={range.from}
              max={range.to || undefined}
              onChange={(event) => handleFromChange(event.target.value)}
            />
          </div>
          <div className="report-range-filter__field">
            <label className="report-range-filter__field-label">Hasta</label>
            <input
              type="date"
              className="report-range-filter__field-input"
              value={range.to}
              min={range.from || undefined}
              onChange={(event) => handleToChange(event.target.value)}
            />
          </div>
        </div>

        {showGranularity ? (
          <label className="report-range-filter__granularity">
            Agrupar por:
            <select
              value={granularity}
              onChange={(event) =>
                onGranularityChange(event.target.value as ReportGranularity)
              }
            >
              <option value="day">Dia</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
          </label>
        ) : null}
      </div>

      {error ? (
        <span className="report-range-filter__error">{error}</span>
      ) : (
        <span className="report-range-filter__summary">
          Mostrando datos del <strong>{formatHumanDate(range.from)}</strong> al{" "}
          <strong>{formatHumanDate(range.to)}</strong> ({days} {days === 1 ? "dia" : "dias"}).
        </span>
      )}
    </div>
  );
}
