import { useState, useMemo, useEffect } from "react";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import {
  WcDateRangeFilter,
  type WcDateRange,
} from "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcDateRangeFilter";
import {
  PatientQuickFilterPopover,
  type PatientQuickFilterState,
} from "@/presentation/modules/patient/components/Patients/PatientQuickFilterPopover";
import type { GenderEnum } from "@/domain/modules/catalog/models/Catalog";

const DEFAULT_FILTERS: PatientQuickFilterState = {
  gender: "all",
  isActive: "all",
};

const MAX_DATE_RANGE_DAYS = 31;

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
      message: `El rango máximo permitido es de ${MAX_DATE_RANGE_DAYS} días.`,
    };
  }

  return { valid: true, message: "" };
}

export function PatientSearchFilters() {
  const { setPatientFilters, hasSearched, setHasSearched, resetPatientFilters, patientFilters } = usePatientStore();
  const { addToast } = useToastStore();

  const [searchQuery, setSearchQuery] = useState(
    () => patientFilters.idNumber || patientFilters.search || ""
  );
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<PatientQuickFilterState>(DEFAULT_FILTERS);
  const [startDate, setStartDate] = useState<string>(() => patientFilters.startDate ?? "");
  const [endDate, setEndDate] = useState<string>(() => patientFilters.endDate ?? "");

  useEffect(() => {
    const storeValue = patientFilters.idNumber || patientFilters.search || "";
    setSearchQuery(storeValue);
  }, [patientFilters.idNumber, patientFilters.search]);

  useEffect(() => {
    setStartDate(patientFilters.startDate ?? "");
    setEndDate(patientFilters.endDate ?? "");
  }, [patientFilters.startDate, patientFilters.endDate]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (localFilters.gender !== "all") count++;
    if (localFilters.isActive !== "all") count++;
    return count;
  }, [localFilters]);

  const hasDateRange = Boolean(startDate || endDate);

  const applySearch = (
    query: string,
    filters: PatientQuickFilterState,
    range: WcDateRange,
  ) => {
    let isActiveFilter: boolean | undefined = undefined;
    if (filters.isActive === "active") isActiveFilter = true;
    if (filters.isActive === "inactive") isActiveFilter = false;

    let genderFilter: GenderEnum | undefined = undefined;
    if (filters.gender !== "all") genderFilter = filters.gender as GenderEnum;

    const cleanQuery = query.trim();
    const isIdNumber = /^\d+$/.test(cleanQuery);

    setPatientFilters({
      idNumber: isIdNumber ? cleanQuery : undefined,
      search: !isIdNumber && cleanQuery ? cleanQuery : undefined,
      gender: genderFilter,
      isActive: isActiveFilter,
      startDate: range.startDate || undefined,
      endDate: range.endDate || undefined,
      page: 1,
    });
    setHasSearched(true);
  };

  const handleApplyFilters = () => {
    applySearch(searchQuery, localFilters, { startDate, endDate });
    setIsFilterPopoverOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters(DEFAULT_FILTERS);
  };

  const handleSearchSubmit = () => {
    const dateValidation = validateDateRange(startDate, endDate);
    if (!dateValidation.valid) {
      addToast({ type: "warning", message: dateValidation.message });
      return;
    }

    if (!searchQuery.trim() && activeFiltersCount === 0 && !hasDateRange) {
      addToast({
        type: "warning",
        message: "Por favor ingrese un término de búsqueda, aplique un filtro o seleccione un rango de fechas.",
      });
      return;
    }

    applySearch(searchQuery, localFilters, { startDate, endDate });
  };

  const handleApplyPreset = (range: WcDateRange) => {
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    applySearch(searchQuery, localFilters, range);
  };

  const handleClear = () => {
    setSearchQuery("");
    setLocalFilters(DEFAULT_FILTERS);
    setStartDate("");
    setEndDate("");
    resetPatientFilters();
  };

  const hasAnyFilterOrSearch =
    searchQuery.trim().length > 0 ||
    activeFiltersCount > 0 ||
    hasDateRange ||
    hasSearched;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "100%" }}>
      <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center", width: "100%", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px" }}>
          <WcSearchInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Buscar pacientes por cédula, nombres o apellidos..."
            showClearButton={true}
            onClear={handleClear}
            showSubmitButton={true}
            onSubmit={handleSearchSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchSubmit();
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          {hasAnyFilterOrSearch && (
            <WcButton
              variant="terciary"
              onClick={handleClear}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-1)",
                height: "34px",
                minHeight: "34px",
                padding: "0 12px",
              }}
              title="Limpia la búsqueda actual y reinicia todos los filtros"
            >
              <Icon name="icon-x" size={14} />
              Restablecer
            </WcButton>
          )}
          <PatientQuickFilterPopover
            isOpen={isFilterPopoverOpen}
            activeFiltersCount={activeFiltersCount}
            filters={localFilters}
            onToggle={() => setIsFilterPopoverOpen((prev) => !prev)}
            onChange={setLocalFilters}
            onClear={handleClearFilters}
            onApply={handleApplyFilters}
          />
        </div>
      </div>

      <WcDateRangeFilter
        title="Periodo de registro"
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApplyPreset={handleApplyPreset}
      />
    </div>
  );
}
