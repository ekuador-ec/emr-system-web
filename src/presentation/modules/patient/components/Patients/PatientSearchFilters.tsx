import { useState } from "react";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";

export function PatientSearchFilters() {
  const { setPatientFilters, setHasSearched, resetPatientFilters } = usePatientStore();
  const [localSearch, setLocalSearch] = useState("");
  const [localIsActive, setLocalIsActive] = useState<string>("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only pass isActive if not 'all'
    let isActiveFilter: boolean | undefined = undefined;
    if (localIsActive === "active") isActiveFilter = true;
    if (localIsActive === "inactive") isActiveFilter = false;

    setPatientFilters({
      search: localSearch.trim(),
      isActive: isActiveFilter,
      page: 1, // Reset to first page on new search
    });
    setHasSearched(true);
  };

  const handleClear = () => {
    setLocalSearch("");
    setLocalIsActive("all");
    resetPatientFilters();
  };

  return (
    <div className="card" style={{ padding: "var(--space-4)" }}>
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          gap: "var(--space-4)",
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <label htmlFor="search-patient" style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
            Búsqueda (Cédula, Nombres)
          </label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-secondary)" }}>
              <Icon name="icon-search" size={16} />
            </div>
            <input
              id="search-patient"
              type="text"
              placeholder="Ej: 1712345678 o Juan Perez"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "36px", width: "100%" }}
            />
          </div>
        </div>

        <div style={{ flex: "0 1 200px", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <label htmlFor="status-patient" style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
            Estado
          </label>
          <select
            id="status-patient"
            value={localIsActive}
            onChange={(e) => setLocalIsActive(e.target.value)}
            className="input-field"
            style={{ width: "100%" }}
          >
            <option value="all">Todos</option>
            <option value="active">Solo Activos</option>
            <option value="inactive">Solo Inactivos (Archivados)</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button type="button" className="btn-ghost" onClick={handleClear}>
            Limpiar
          </button>
          <button type="submit" className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Icon name="icon-search" size={18} />
            Buscar
          </button>
        </div>
      </form>
    </div>
  );
}
