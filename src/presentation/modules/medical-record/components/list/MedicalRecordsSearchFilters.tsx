import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useMedicalRecordStore } from "@/presentation/modules/medical-record/stores/useMedicalRecordStore";
import { useEffect, useState } from "react";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import {
  formatMedicalRecordDateRange,
  getRecentMedicalRecordDateRange,
  type MedicalRecordDateRange,
} from "@/presentation/modules/medical-record/utils/dateRange";
import { MedicalRecordsDateFilterPopover } from "@/presentation/modules/medical-record/components/list/MedicalRecordsDateFilterPopover";

export function MedicalRecordsSearchFilters() {
  const { setFilters, filters } = useMedicalRecordStore();
  const { addToast } = useToastStore();
  const defaultDateRange = getRecentMedicalRecordDateRange();
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [localStartDate, setLocalStartDate] = useState(
    filters.startDate || defaultDateRange.startDate,
  );
  const [localEndDate, setLocalEndDate] = useState(filters.endDate || defaultDateRange.endDate);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  useEffect(() => {
    if (filters.search !== undefined) {
      setLocalSearch(filters.search);
      return;
    }

    if (filters.startDate && filters.endDate) {
      setLocalStartDate(filters.startDate);
      setLocalEndDate(filters.endDate);
      return;
    }

    if (!filters.search && !filters.startDate && !filters.endDate) {
      setLocalSearch("");
      setLocalStartDate(defaultDateRange.startDate);
      setLocalEndDate(defaultDateRange.endDate);
    }
  }, [
    defaultDateRange.endDate,
    defaultDateRange.startDate,
    filters.endDate,
    filters.search,
    filters.startDate,
  ]);

  const applySearchFilters = () => {
    const normalizedSearch = localSearch.trim();

    if (!normalizedSearch) {
      setFilters({
        search: undefined,
        page: 1,
      });
      return;
    }

    setFilters({
      search: normalizedSearch,
      startDate: undefined,
      endDate: undefined,
      page: 1,
    });

    setIsDatePopoverOpen(false);
  };

  const applyDateFilters = () => {
    if (localStartDate && localEndDate) {
      const start = new Date(localStartDate);
      const end = new Date(localEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 31) {
        addToast({
          type: "warning",
          message: "El rango de búsqueda por fecha de edición no puede ser mayor a 31 días.",
        });
        return;
      }

      if (start > end) {
        addToast({
          type: "warning",
          message: "La fecha inicial no puede ser mayor que la fecha final.",
        });
        return;
      }
    } else if ((localStartDate && !localEndDate) || (!localStartDate && localEndDate)) {
      addToast({
        type: "warning",
        message: "Debes ingresar ambas fechas o dejar ambas vacías.",
      });
      return;
    }

    setFilters({
      search: undefined,
      startDate: localStartDate || undefined,
      endDate: localEndDate || undefined,
      page: 1,
    });

    setLocalSearch("");
    setIsDatePopoverOpen(false);
  };

  const clearDateFilters = () => {
    setLocalStartDate(defaultDateRange.startDate);
    setLocalEndDate(defaultDateRange.endDate);
    setLocalSearch("");
    setFilters({
      search: undefined,
      startDate: defaultDateRange.startDate,
      endDate: defaultDateRange.endDate,
      page: 1,
    });
    setIsDatePopoverOpen(false);
  };

  const handlePresetRange = (range: MedicalRecordDateRange) => {
    setLocalStartDate(range.startDate);
    setLocalEndDate(range.endDate);
    setFilters({
      search: undefined,
      startDate: range.startDate,
      endDate: range.endDate,
      page: 1,
    });
    setLocalSearch("");
    setIsDatePopoverOpen(false);
  };

  const activeModeLabel = filters.search?.trim()
    ? `Búsqueda textual: ${filters.search.trim()}`
    : filters.startDate && filters.endDate
      ? `Rango: ${formatMedicalRecordDateRange({ startDate: filters.startDate, endDate: filters.endDate })}`
      : `Rango por defecto: ${formatMedicalRecordDateRange(defaultDateRange)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "100%" }}>
      <div
        className="card"
        style={{
          padding: "var(--space-5)",
          display: "grid",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              flexWrap: "wrap",
            }}
          >
            <Icon name="icon-search-folder" size={18} />
            <h2 style={{ margin: 0, fontSize: "var(--font-size-lg)" }}>
              Consulta de historias clínicas
            </h2>
          </div>
          <p
            style={{
              margin: 0,
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            Usa el buscador para localizar por nombre, apellido o cédula, o abre el filtro de fecha
            para acotar por edición.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: "var(--space-3)",
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <WcSearchInput
              value={localSearch}
              onValueChange={setLocalSearch}
              placeholder="Buscar por nombre, apellido o cédula..."
              showSearchIcon={true}
              showClearButton={true}
              showSubmitButton={true}
              submitButtonLabel="Buscar"
              onSubmit={applySearchFilters}
            />
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-2)",
                alignItems: "center",
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-xs)",
              }}
            >
              <span
                style={{
                  padding: "var(--space-1) var(--space-2)",
                  borderRadius: "999px",
                  border: "1px solid var(--color-border)",
                }}
              >
                Búsqueda textual independiente
              </span>
              <span
                style={{
                  padding: "var(--space-1) var(--space-2)",
                  borderRadius: "999px",
                  border: "1px solid var(--color-border)",
                }}
              >
                {activeModeLabel}
              </span>
            </div>
          </div>

          <MedicalRecordsDateFilterPopover
            isOpen={isDatePopoverOpen}
            onToggle={() => setIsDatePopoverOpen((prev) => !prev)}
            startDate={localStartDate}
            endDate={localEndDate}
            activeFiltersCount={filters.startDate && filters.endDate ? 1 : 0}
            onStartDateChange={setLocalStartDate}
            onEndDateChange={setLocalEndDate}
            onApply={applyDateFilters}
            onClear={clearDateFilters}
            onPresetRange={handlePresetRange}
          />
        </div>
      </div>
    </div>
  );
}
