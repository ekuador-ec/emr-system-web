import { useState } from "react";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import type { GenderEnum } from "@/domain/modules/catalog/models/Catalog";

export function PatientSearchFilters() {
  const { setPatientFilters, setHasSearched, resetPatientFilters } = usePatientStore();
  const { addToast } = useToastStore();

  const [localIdNumber, setLocalIdNumber] = useState("");
  const [localFirstName, setLocalFirstName] = useState("");
  const [localLastName, setLocalLastName] = useState("");
  const [localGender, setLocalGender] = useState<GenderEnum | "all">("all");
  const [localIsActive, setLocalIsActive] = useState<string>("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const idNumber = localIdNumber.trim();
    const firstName = localFirstName.trim();
    const lastName = localLastName.trim();

    if (!idNumber && !firstName && !lastName) {
      addToast({
        type: "error",
        message: "Debe ingresar al menos un criterio (Cédula, Nombres o Apellidos) para buscar.",
      });
      return;
    }

    let isActiveFilter: boolean | undefined = undefined;
    if (localIsActive === "active") isActiveFilter = true;
    if (localIsActive === "inactive") isActiveFilter = false;

    setPatientFilters({
      idNumber: idNumber || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      gender: localGender === "all" ? undefined : localGender as GenderEnum,
      isActive: isActiveFilter,
      page: 1, // Reset to first page on new search
    });

    setHasSearched(true);
  };

  const handleClear = () => {
    setLocalIdNumber("");
    setLocalFirstName("");
    setLocalLastName("");
    setLocalGender("all");
    setLocalIsActive("all"); // default
    resetPatientFilters();
  };

  return (
    <div className="card" style={{ padding: "var(--space-4)" }}>
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}>
          <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <label htmlFor="search-id" style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
              Número de Cédula
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                id="search-id"
                type="text"
                placeholder="Ej: 1712345678"
                value={localIdNumber}
                onChange={(e) => setLocalIdNumber(e.target.value)}
                className="input-field"
                style={{ paddingRight: "30px", width: "100%" }}
              />
              {localIdNumber && (
                <button
                  type="button"
                  onClick={() => setLocalIdNumber("")}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
                  aria-label="Limpiar cédula"
                >
                  <Icon name="icon-x" size={14} />
                </button>
              )}
            </div>
          </div>

          <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <label htmlFor="search-firstname" style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
              Nombres
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                id="search-firstname"
                type="text"
                placeholder="Ej: Juan Pablo"
                value={localFirstName}
                onChange={(e) => setLocalFirstName(e.target.value)}
                className="input-field"
                style={{ paddingRight: "30px", width: "100%" }}
              />
              {localFirstName && (
                <button
                  type="button"
                  onClick={() => setLocalFirstName("")}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
                  aria-label="Limpiar nombres"
                >
                  <Icon name="icon-x" size={14} />
                </button>
              )}
            </div>
          </div>

          <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <label htmlFor="search-lastname" style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
              Apellidos
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                id="search-lastname"
                type="text"
                placeholder="Ej: Perez Muñoz"
                value={localLastName}
                onChange={(e) => setLocalLastName(e.target.value)}
                className="input-field"
                style={{ paddingRight: "30px", width: "100%" }}
              />
              {localLastName && (
                <button
                  type="button"
                  onClick={() => setLocalLastName("")}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
                  aria-label="Limpiar apellidos"
                >
                  <Icon name="icon-x" size={14} />
                </button>
              )}
            </div>
          </div>
          
          <div style={{ flex: "1 1 150px", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <label htmlFor="search-gender" style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
              Género
            </label>
            <select
              id="search-gender"
              value={localGender}
              onChange={(e) => setLocalGender(e.target.value as GenderEnum | "all")}
              className="input-field"
            >
              <option value="all">Todos</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
            </select>
          </div>

          <div style={{ flex: "1 1 150px", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <label htmlFor="status-patient" style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
              Estado
            </label>
            <select
              id="status-patient"
              value={localIsActive}
              onChange={(e) => setLocalIsActive(e.target.value)}
              className="input-field"
            >
              <option value="active">Solo Activos</option>
              <option value="inactive">Solo Inactivos (Archivados)</option>
              <option value="all">Todos</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
          <button type="button" className="btn-ghost" onClick={handleClear}>
            Limpiar Filtros
          </button>
          <button type="submit" className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Icon name="icon-search" size={18} />
            Buscar Paciente
          </button>
        </div>
      </form>
    </div>
  );
}
