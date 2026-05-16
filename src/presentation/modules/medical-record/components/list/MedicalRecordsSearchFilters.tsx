import { useState, useEffect } from "react";
import { useMedicalRecordStore } from "@/presentation/modules/medical-record/stores/useMedicalRecordStore";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import {
  WcDateRangeFilter,
  type WcDateRange,
} from "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcDateRangeFilter";

const MAX_DATE_RANGE_DAYS = 31;

const DATE_PRESETS = [
  { label: "Últimos 2 días", daysBack: 1 },
  { label: "Últimos 7 días", daysBack: 6 },
  { label: "Últimos 31 días", daysBack: 30 },
];

function validateDateRange(
  startDate: string,
  endDate: string,
): { valid: boolean; message: string } {
  if (!startDate && !endDate) return { valid: true, message: "" };
  if (!startDate || !endDate) {
    return { valid: false, message: "Debe ingresar ambas fechas para filtrar por rango." };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return { valid: false, message: "La fecha inicial no puede ser mayor que la fecha final." };
  }

  const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > MAX_DATE_RANGE_DAYS) {
    return {
      valid: false,
      message: `El rango de búsqueda por fecha de edición no puede ser mayor a ${MAX_DATE_RANGE_DAYS} días.`,
    };
  }

  return { valid: true, message: "" };
}

export function MedicalRecordsSearchFilters() {
  const { setFilters, resetFilters, filters } = useMedicalRecordStore();
  const { addToast } = useToastStore();

  const [searchQuery, setSearchQuery] = useState<string>(() => filters.search ?? "");
  const [startDate, setStartDate] = useState<string>(() => filters.startDate ?? "");
  const [endDate, setEndDate] = useState<string>(() => filters.endDate ?? "");

  useEffect(() => {
    setSearchQuery(filters.search ?? "");
  }, [filters.search]);

  useEffect(() => {
    setStartDate(filters.startDate ?? "");
    setEndDate(filters.endDate ?? "");
  }, [filters.startDate, filters.endDate]);

  const hasDateRange = Boolean(startDate || endDate);

  const applyFilters = (search: string, range: WcDateRange) => {
    const cleanQuery = search.trim();
    setFilters({
      search: cleanQuery || undefined,
      startDate: range.startDate || undefined,
      endDate: range.endDate || undefined,
      page: 1,
    });
  };

  const handleSearchSubmit = () => {
    const validation = validateDateRange(startDate, endDate);
    if (!validation.valid) {
      addToast({ type: "warning", message: validation.message });
      return;
    }

    if (!searchQuery.trim() && !hasDateRange) {
      addToast({
        type: "warning",
        message: "Por favor ingrese un término de búsqueda o seleccione un rango de fechas.",
      });
      return;
    }

    applyFilters(searchQuery, { startDate, endDate });
  };

  const handleApplyPreset = (range: WcDateRange) => {
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    applyFilters(searchQuery, range);
  };

  const handleReset = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    resetFilters();
  };

  const hasAnyExplicitFilter = Boolean(
    searchQuery.trim() || hasDateRange || filters.search || filters.startDate || filters.endDate,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: "var(--space-4)",
          alignItems: "center",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 300px" }}>
          <WcSearchInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Buscar por nombre, apellido o cédula..."
            showSearchIcon={true}
            showClearButton={true}
            onClear={() => setSearchQuery("")}
            showSubmitButton={true}
            submitButtonLabel="Buscar"
            onSubmit={handleSearchSubmit}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearchSubmit();
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          {hasAnyExplicitFilter && (
            <WcButton
              variant="terciary"
              onClick={handleReset}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-1)",
                height: "34px",
                minHeight: "34px",
                padding: "0 12px",
              }}
              title="Vuelve al filtro por defecto (últimas 48h)"
            >
              <Icon name="icon-restore" size={14} />
              Restablecer
            </WcButton>
          )}
        </div>
      </div>

      <WcDateRangeFilter
        title="Periodo de edición"
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApplyPreset={handleApplyPreset}
        presets={DATE_PRESETS}
      />
    </div>
  );
}
