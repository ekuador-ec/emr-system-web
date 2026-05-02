import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PatientDetailsDrawer } from "@/presentation/modules/patient/components/Patients/PatientDetailsDrawer";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import { WcTabsFolder } from "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useEvolutions } from "@/presentation/modules/evolution/hooks/useEvolutions";
import { CreateEvolutionModal } from "@/presentation/modules/evolution/components/list/CreateEvolutionModal";
import { EvolutionResultsTable } from "@/presentation/modules/evolution/components/list/EvolutionResultsTable";
import {
  formatEvolutionDateRange,
  getRecentEvolutionDateRange,
  type EvolutionDateRange,
} from "@/presentation/modules/evolution/utils/dateRange";
import { type EvolutionFilters } from "@/domain/modules/evolution/models/Evolution";
import { useEvolutionsListStore } from "@/presentation/modules/evolution/stores/useEvolutionsListStore";
import "@/presentation/modules/evolution/pages/EvolutionsPage.css";

const defaultRange = getRecentEvolutionDateRange();

function isDateRangeValid(startDate: string, endDate: string, searchInput: string) {
  if (!startDate && !endDate) {
    if (!searchInput.trim()) {
      return { valid: false, message: "Debe ingresar fechas o un término de búsqueda." };
    }
    return { valid: true, message: "" };
  }

  if (!startDate || !endDate) {
    return { valid: false, message: "Debe ingresar ambas fechas para filtrar por rango." };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return { valid: false, message: "La fecha inicial no puede ser mayor que la fecha final." };
  }

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (!searchInput.trim() && diffDays > 31) {
    return {
      valid: false,
      message: "Sin término de búsqueda, el rango máximo permitido es de 31 días.",
    };
  }

  return { valid: true, message: "" };
}

function buildFilters(filters: EvolutionFilters): EvolutionFilters {
  return {
    ...filters,
    search: filters.search?.trim() || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };
}

function buildPresetRange(daysBack: number): EvolutionDateRange {
  const endDate = new Date();
  const startDate = new Date();

  startDate.setDate(endDate.getDate() - daysBack);

  const pad = (value: number) => `${value}`.padStart(2, "0");
  const toInputValue = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  return {
    startDate: toInputValue(startDate),
    endDate: toInputValue(endDate),
  };
}

export function EvolutionsPage() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [recentPage, setRecentPage] = useState(1);

  const {
    activeTab,
    searchInput,
    draftStartDate,
    draftEndDate,
    appliedSearch,
    appliedStartDate,
    appliedEndDate,
    advancedPage,
    setActiveTab,
    setSearchInput,
    setDraftStartDate,
    setDraftEndDate,
    applyFilters,
    setAdvancedPage,
    clearAdvancedFilters,
  } = useEvolutionsListStore();

  const recentFilters = useMemo(
    () =>
      buildFilters({
        startDate: defaultRange.startDate,
        endDate: defaultRange.endDate,
        page: recentPage,
        limit: 8,
      }),
    [recentPage],
  );

  const advancedFilters = useMemo(
    () =>
      buildFilters({
        search: appliedSearch,
        startDate: appliedStartDate,
        endDate: appliedEndDate,
        page: advancedPage,
        limit: 10,
      }),
    [advancedPage, appliedEndDate, appliedSearch, appliedStartDate],
  );

  const recentQuery = useEvolutions(recentFilters);
  const advancedQueryEnabled = Boolean(
    appliedSearch.trim() || (appliedStartDate && appliedEndDate),
  );
  const advancedQuery = useEvolutions(advancedFilters, { enabled: advancedQueryEnabled });

  const recentStats = useMemo(() => {
    const items = recentQuery.data?.data ?? [];
    return {
      total: recentQuery.data?.total ?? 0,
      abiertas: items.filter((item) => item.status === "ABIERTA").length,
      enProceso: items.filter((item) => item.status === "EN_PROCESO").length,
      cerradas: items.filter((item) => item.status === "CERRADA").length,
    };
  }, [recentQuery.data?.data, recentQuery.data?.total]);

  const activeSearchLabel = appliedSearch.trim()
    ? `Búsqueda: ${appliedSearch.trim()}`
    : "Sin búsqueda textual";

  const activeDateLabel =
    appliedStartDate && appliedEndDate
      ? formatEvolutionDateRange({
          startDate: appliedStartDate,
          endDate: appliedEndDate,
        })
      : "Sin filtro de fechas";


  const handleApplyAdvancedFilters = () => {
    const validation = isDateRangeValid(draftStartDate, draftEndDate, searchInput);

    if (!validation.valid) {
      addToast({
        type: "warning",
        message: validation.message,
      });
      return;
    }

    applyFilters(searchInput.trim(), draftStartDate, draftEndDate);
  };

  const handleClearAdvancedFilters = () => {
    clearAdvancedFilters();
  };

  const applyPresetRange = (range: EvolutionDateRange) => {
    setDraftStartDate(range.startDate);
    setDraftEndDate(range.endDate);
    applyFilters(searchInput.trim(), range.startDate, range.endDate);
  };

  const recentTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "var(--space-3)",
        }}
      >
        <div
          className="card"
          style={{ padding: "var(--space-4)", borderLeft: "4px solid var(--color-warning)" }}
        >
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
            Abiertas
          </div>
          <div
            style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-semibold)" }}
          >
            {recentStats.abiertas}
          </div>
        </div>
        <div
          className="card"
          style={{ padding: "var(--space-4)", borderLeft: "4px solid var(--color-primary)" }}
        >
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
            En proceso
          </div>
          <div
            style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-semibold)" }}
          >
            {recentStats.enProceso}
          </div>
        </div>
        <div
          className="card"
          style={{ padding: "var(--space-4)", borderLeft: "4px solid var(--color-success)" }}
        >
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
            Cerradas
          </div>
          <div
            style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-semibold)" }}
          >
            {recentStats.cerradas}
          </div>
        </div>
      </div>

      <EvolutionResultsTable
        result={recentQuery.data}
        isLoading={recentQuery.isFetching}
        emptyMessage="No se encontraron evoluciones médicas recientes."
        onPageChange={setRecentPage}
      />
    </div>
  );

  const advancedHasAppliedFilters = advancedQueryEnabled;
  const advancedIsLoading = advancedQuery.isFetching;
  const hasAnythingToClear = Boolean(
    searchInput || draftStartDate || draftEndDate || appliedSearch || appliedStartDate || appliedEndDate,
  );

  const advancedTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <section
        className="card"
        style={{
          padding: "var(--space-5)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          background: "linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(15, 23, 42, 0.02))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <h3 style={{ margin: 0 }}>Consulta avanzada</h3>
            <p
              style={{
                margin: 0,
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              Busca evoluciones por historia clinica, paciente o rango de fechas. Cuando busca
              unicamente por fechas, el rango maximo permitido es de 31 dias.
            </p>
          </div>
          {advancedIsLoading ? (
            <div className="evolutions-advanced__loading-overlay">
              <span className="evolutions-advanced__spinner" />
              Buscando...
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 260px",
            gap: "var(--space-3)",
            alignItems: "end",
          }}
        >
          <WcSearchInput
            value={searchInput}
            onValueChange={setSearchInput}
            placeholder="Buscar por cedula, nombre, apellido o HC..."
            showSubmitButton
            submitButtonLabel="Buscar"
            onSubmit={handleApplyAdvancedFilters}
            onClear={() => setSearchInput("")}
            disabled={advancedIsLoading}
          />

          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <WcButton
              variant="terciary"
              onClick={handleClearAdvancedFilters}
              style={{ flex: 1 }}
              disabled={advancedIsLoading || !hasAnythingToClear}
            >
              <Icon name="icon-restore" size={16} />
              Restablecer
            </WcButton>
            <WcButton
              variant="primary"
              onClick={handleApplyAdvancedFilters}
              style={{ flex: 1 }}
              disabled={advancedIsLoading}
            >
              Aplicar
            </WcButton>
          </div>
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
              value={draftStartDate}
              onChange={(event) => setDraftStartDate(event.target.value)}
              disabled={advancedIsLoading}
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
              value={draftEndDate}
              onChange={(event) => setDraftEndDate(event.target.value)}
              disabled={advancedIsLoading}
            />
          </div>
        </div>

        {advancedHasAppliedFilters ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-2)",
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
              {activeSearchLabel}
            </span>
            <span
              style={{
                padding: "var(--space-1) var(--space-2)",
                borderRadius: "999px",
                border: "1px solid var(--color-border)",
              }}
            >
              {activeDateLabel}
            </span>
          </div>
        ) : null}
      </section>

      {advancedHasAppliedFilters ? (
        <EvolutionResultsTable
          result={advancedQuery.data}
          isLoading={advancedIsLoading}
          emptyMessage="No se encontraron evoluciones con los filtros aplicados."
          onPageChange={setAdvancedPage}
        />
      ) : (
        <div className="evolutions-advanced__initial-state">
          <div className="evolutions-advanced__initial-icon">
            <Icon name="icon-file-search" size={28} />
          </div>
          <h4 className="evolutions-advanced__initial-title">
            Realiza una consulta para ver resultados
          </h4>
          <p className="evolutions-advanced__initial-description">
            Utiliza la barra de busqueda, selecciona un rango de fechas, o elige una de las
            opciones rapidas a continuacion.
          </p>
          <div className="evolutions-advanced__presets">
            <span className="evolutions-advanced__presets-label">Acceso rapido:</span>
            <WcButton variant="terciary" onClick={() => applyPresetRange(buildPresetRange(6))}>
              Últimos 7 dias
            </WcButton>
            <WcButton variant="terciary" onClick={() => applyPresetRange(buildPresetRange(14))}>
              Últimos 15 dias
            </WcButton>
            <WcButton variant="terciary" onClick={() => applyPresetRange(buildPresetRange(30))}>
              Últimos 31 dias
            </WcButton>
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    {
      name: "Últimas 48 horas",
      icon: <Icon name="icon-file-time" size={16} />,
      content: recentTab,
    },
    {
      name: "Consulta avanzada",
      icon: <Icon name="icon-file-search" size={16} />,
      content: advancedTab,
    },
  ];

  return (
    <div style={{ padding: "var(--space-8)", maxWidth: "1300px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "var(--space-4)",
          flexWrap: "wrap",
          marginBottom: "var(--space-6)",
          padding: "var(--space-6)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.03), rgba(6, 182, 212, 0.08))",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
            maxWidth: "720px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-1) var(--space-3)",
                borderRadius: "999px",
                backgroundColor: "rgba(6, 182, 212, 0.12)",
                color: "var(--color-primary)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              <Icon name="icon-medical-evolution" size={14} />
              Módulo clínico
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 3vw, 3rem)", lineHeight: 1.05 }}>
            Evoluciones Médicas
          </h1>
          <p style={{ margin: 0, color: "var(--color-text-secondary)", maxWidth: "64ch" }}>
            Supervisa las evoluciones creadas o modificadas recientemente, filtra por paciente o
            historia clínica y abre nuevas evoluciones sin salir del flujo operativo.
          </p>
        </div>

        <div
          style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}
        >
          <WcButton variant="secondary" onClick={() => navigate("/historias-clinicas")}>
            <Icon name="icon-clinical-history" size={16} />
            Historias Clínicas
          </WcButton>
          <WcButton variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <Icon name="icon-add-file" size={16} />
            Nueva Evolución
          </WcButton>
        </div>
      </div>

      <WcTabsFolder tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      <CreateEvolutionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <PatientDetailsDrawer />
    </div>
  );
}
