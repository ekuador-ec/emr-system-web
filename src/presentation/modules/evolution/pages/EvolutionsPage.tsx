import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PatientDetailsDrawer } from "@/presentation/modules/patient/components/Patients/PatientDetailsDrawer";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import { WcTabsFolder } from "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder";
import { WcModuleHeader } from "@/presentation/modules/shared/components/ui/webcomponents/Headers/WcModuleHeader";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useEvolutions } from "@/presentation/modules/evolution/hooks/useEvolutions";
import { CreateEvolutionModal } from "@/presentation/modules/evolution/components/list/CreateEvolutionModal";
import { EvolutionResultsTable } from "@/presentation/modules/evolution/components/list/EvolutionResultsTable";
import {
  formatEvolutionDateRange,
  getRecentEvolutionDateRange,
  type EvolutionDateRange,
} from "@/presentation/modules/evolution/utils/dateRange";
import type {
  EvolutionFilters,
  EvolutionStatus,
  PaginatedResult,
  MedicalEvolutionListItem,
} from "@/domain/modules/evolution/models/Evolution";
import { useEvolutionsListStore } from "@/presentation/modules/evolution/stores/useEvolutionsListStore";
import "@/presentation/modules/evolution/pages/EvolutionsPage.css";

const defaultRange = getRecentEvolutionDateRange();
const RECENT_PAGE_SIZE = 8;
const RECENT_FETCH_LIMIT = 1000;

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
  const [recentStatusFilter, setRecentStatusFilter] = useState<EvolutionStatus | "ALL">("ALL");
  const [recentLocalSearchInput, setRecentLocalSearchInput] = useState("");
  const [recentLocalSearchApplied, setRecentLocalSearchApplied] = useState("");

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
        endDate: undefined,
        page: 1,
        limit: RECENT_FETCH_LIMIT,
      }),
    [],
  );

  const advancedFilters = useMemo(
    () =>
      buildFilters({
        search: appliedSearch,
        startDate: appliedStartDate,
        endDate: appliedEndDate,
        page: advancedPage,
      }),
    [advancedPage, appliedEndDate, appliedSearch, appliedStartDate],
  );

  const recentQuery = useEvolutions(recentFilters);
  const advancedQueryEnabled = Boolean(
    appliedSearch.trim() || (appliedStartDate && appliedEndDate),
  );
  const advancedQuery = useEvolutions(advancedFilters, { enabled: advancedQueryEnabled });

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

  const recentStatCards = [
    {
      status: "ALL" as const,
      icon: "icon-table-solid",
      label: "Todas",
      caption: "Sin filtro",
    },
    {
      status: "ABIERTA" as const,
      icon: "icon-note-solid",
      label: "Abiertas",
      caption: "Registros activos",
    },
    {
      status: "EN_PROCESO" as const,
      icon: "icon-calendar-solid",
      label: "En proceso",
      caption: "Atención en curso",
    },
    {
      status: "CERRADA" as const,
      icon: "icon-lock-solid",
      label: "Cerradas",
      caption: "Proceso finalizado",
    },
  ] as const;

  const activeRecentStatusCard = useMemo(
    () => recentStatCards.find((card) => card.status === recentStatusFilter) ?? recentStatCards[0],
    [recentStatCards, recentStatusFilter],
  );

  const applyRecentLocalSearch = () => {
    setRecentPage(1);
    setRecentLocalSearchApplied(recentLocalSearchInput.trim());
  };

  const recentFilteredItems = useMemo<MedicalEvolutionListItem[]>(() => {
    if (!recentQuery.data) {
      return [];
    }

    const normalizedSearch = recentLocalSearchApplied.toLowerCase();
    const statusFilteredItems = recentQuery.data.data.filter((item) => {
      if (recentStatusFilter === "ALL") {
        return true;
      }
      return item.status === recentStatusFilter;
    });

    const filteredItems = statusFilteredItems.filter((item) => {
      if (!normalizedSearch) {
        return true;
      }

      const searchable = [
        item.patientName,
        item.patientIdNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });

    return filteredItems;
  }, [recentLocalSearchApplied, recentQuery.data, recentStatusFilter]);

  const recentFilteredTotal = recentFilteredItems.length;
  const recentTotalPages = Math.max(1, Math.ceil(recentFilteredTotal / RECENT_PAGE_SIZE));

  useEffect(() => {
    if (recentPage > recentTotalPages) {
      setRecentPage(recentTotalPages);
    }
  }, [recentPage, recentTotalPages]);

  const recentFilteredResult = useMemo<PaginatedResult<MedicalEvolutionListItem> | undefined>(() => {
    if (!recentQuery.data) {
      return undefined;
    }

    const pageStart = (recentPage - 1) * RECENT_PAGE_SIZE;
    const paginatedItems = recentFilteredItems.slice(pageStart, pageStart + RECENT_PAGE_SIZE);

    return {
      data: paginatedItems,
      total: recentFilteredTotal,
      page: recentPage,
      limit: RECENT_PAGE_SIZE,
    };
  }, [recentFilteredItems, recentFilteredTotal, recentPage, recentQuery.data]);

  const recentEmptyMessage = useMemo(() => {
    if (recentStatusFilter === "ABIERTA") {
      return "No se encontraron evoluciones abiertas en los registros cargados.";
    }

    if (recentStatusFilter === "EN_PROCESO") {
      return "No se encontraron evoluciones en proceso en los registros cargados.";
    }

    if (recentStatusFilter === "CERRADA") {
      return "No se encontraron evoluciones cerradas en los registros cargados.";
    }

    if (recentLocalSearchApplied) {
      return "No hay coincidencias en los registros cargados para esta búsqueda.";
    }

    return "No se encontraron evoluciones médicas recientes.";
  }, [recentLocalSearchApplied, recentStatusFilter]);

  const activeRecentFilterTotal = recentFilteredTotal;

  const recentTab = (
    <div className="evolutions-recent">
      <div className="evolutions-recent-filter-layout">
        <section className="card evolutions-recent-filter-panel">
          <div className="evolutions-recent-filter-panel__header">
            <h4 className="evolutions-recent-filter-panel__title">Filtrar resultados por estado</h4>
          </div>
          <div className="evolutions-recent-filter-panel__controls">
            <div className="evolutions-recent-filter-panel__actions">
              {recentStatCards.map((card) => (
                <WcButton
                  key={card.status}
                  variant={recentStatusFilter === card.status ? "primary" : "terciary"}
                  className="evolutions-recent-filter-panel__button"
                  onClick={() => {
                    setRecentPage(1);
                    setRecentStatusFilter(card.status);
                  }}
                  aria-pressed={recentStatusFilter === card.status}
                >
                  <span className="evolutions-recent-filter-panel__button-content">
                    <Icon name={card.icon} size={14} />
                    <span className="evolutions-recent-filter-panel__button-label">{card.label}</span>
                  </span>
                </WcButton>
              ))}
            </div>
            <WcSearchInput
              value={recentLocalSearchInput}
              onValueChange={setRecentLocalSearchInput}
              placeholder="Buscar paciente"
              wrapperClassName="evolutions-recent-filter-panel__search"
              aria-label="Buscar en resultados cargados"
              showSubmitButton
              submitButtonLabel="Buscar"
              onSubmit={applyRecentLocalSearch}
              onClear={() => {
                setRecentPage(1);
                setRecentLocalSearchInput("");
                setRecentLocalSearchApplied("");
              }}
              submitButtonDisabled={recentLocalSearchInput.trim() === recentLocalSearchApplied}
            />
          </div>
        </section>

        <aside className="evolutions-recent-status-card" aria-live="polite">
          <p className="evolutions-recent-status-card__title">Total</p>
          <div className="evolutions-recent-status-card__value">{activeRecentFilterTotal}</div>
          <p className="evolutions-recent-status-card__state">{activeRecentStatusCard.label}</p>
        </aside>
      </div>

      <EvolutionResultsTable
        result={recentFilteredResult}
        isLoading={recentQuery.isFetching}
        emptyMessage={recentEmptyMessage}
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
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, transparent), color-mix(in srgb, var(--color-bg) 18%, var(--color-surface)))",
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
            gridTemplateColumns: "minmax(0, 1fr) calc(var(--space-10) * 6.5)",
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
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--color-border)",
              }}
            >
              {activeSearchLabel}
            </span>
            <span
              style={{
                padding: "var(--space-1) var(--space-2)",
                borderRadius: "var(--radius-full)",
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
    <div
      style={{
        padding: "var(--space-8)",
        maxWidth: "calc(var(--space-10) * 32.5)",
        margin: "0 auto",
      }}
    >
      <WcModuleHeader
        moduleName="Módulo clínico"
        moduleIcon="icon-medical-evolution"
        title="Evoluciones Médicas"
        description="Supervisa las evoluciones creadas o modificadas recientemente, filtra por paciente o historia clínica y abre nuevas evoluciones sin salir del flujo operativo."
      >
        <WcButton variant="primary" onClick={() => navigate("/historias-clinicas")}>
          <Icon name="icon-clinical-history" size={14} />
          Historias Clínicas
        </WcButton>
        <WcButton variant="terciary" onClick={() => setIsCreateModalOpen(true)}>
          <Icon name="icon-add-file" size={14} />
          Nueva Evolución
        </WcButton>
      </WcModuleHeader>

      <WcTabsFolder tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      <CreateEvolutionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <PatientDetailsDrawer />
    </div>
  );
}
