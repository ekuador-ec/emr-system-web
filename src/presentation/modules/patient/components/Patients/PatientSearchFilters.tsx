import { useState, useMemo, useEffect } from "react";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
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

function toLocalDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildPresetRange(daysBack: number): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - daysBack);
  return {
    startDate: toLocalDateInputValue(startDate),
    endDate: toLocalDateInputValue(endDate),
  };
}

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
    range: { startDate: string; endDate: string },
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

  const handleApplyPreset = (daysBack: number) => {
    const range = buildPresetRange(daysBack);
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
                fontSize: "var(--font-size-sm)",
                padding: "var(--space-2) var(--space-3)",
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

      <div
        className="card"
        style={{
          padding: "var(--space-3) var(--space-4)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
          <Icon name="icon-calendar" size={16} />
          <span>Periodo de registro</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <label style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>Desde</label>
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              max={endDate || undefined}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <label style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>Hasta</label>
            <input
              type="date"
              className="input-field"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              min={startDate || undefined}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap", marginLeft: "auto" }}>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>Acceso rápido:</span>
          <WcButton variant="terciary" onClick={() => handleApplyPreset(6)}>
            Últimos 7 días
          </WcButton>
          <WcButton variant="terciary" onClick={() => handleApplyPreset(14)}>
            Últimos 15 días
          </WcButton>
          <WcButton variant="terciary" onClick={() => handleApplyPreset(30)}>
            Últimos 31 días
          </WcButton>
        </div>
      </div>
    </div>
  );
}
