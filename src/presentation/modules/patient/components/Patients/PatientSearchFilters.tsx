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

export function PatientSearchFilters() {
  const { setPatientFilters, hasSearched, setHasSearched, resetPatientFilters, patientFilters } = usePatientStore();
  const { addToast } = useToastStore();

  const [searchQuery, setSearchQuery] = useState(
    () => patientFilters.idNumber || patientFilters.search || ""
  );
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<PatientQuickFilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    const storeValue = patientFilters.idNumber || patientFilters.search || "";
    setSearchQuery(storeValue);
  }, [patientFilters.idNumber, patientFilters.search]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (localFilters.gender !== "all") count++;
    if (localFilters.isActive !== "all") count++;
    return count;
  }, [localFilters]);

  const applySearch = (query: string, filters: PatientQuickFilterState) => {
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
      page: 1,
    });
    setHasSearched(true);
  };

  const handleApplyFilters = () => {
    applySearch(searchQuery, localFilters);
    setIsFilterPopoverOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters(DEFAULT_FILTERS);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim() && activeFiltersCount === 0) {
      addToast({
        type: "warning",
        message: "Por favor ingrese un término de búsqueda o aplique un filtro.",
      });
      return;
    }
    applySearch(searchQuery, localFilters);
  };

  const handleClear = () => {
    setSearchQuery("");
    setLocalFilters(DEFAULT_FILTERS);
    resetPatientFilters();
  };

  const hasAnyFilterOrSearch = 
    searchQuery.trim().length > 0 || 
    activeFiltersCount > 0 ||
    hasSearched;

  return (
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
              padding: "var(--space-2) var(--space-3)"
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
  );
}
