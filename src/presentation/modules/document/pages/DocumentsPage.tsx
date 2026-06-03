import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import { WcSelect } from "@/presentation/modules/shared/components/ui/webcomponents/Inputs";
import { WcTabsFolder } from "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder";
import { WcModuleHeader } from "@/presentation/modules/shared/components/ui/webcomponents/Headers/WcModuleHeader";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { PatientDetailsDrawer } from "@/presentation/modules/patient/components/Patients/PatientDetailsDrawer";
import { useClinicalDocuments } from "@/presentation/modules/document/hooks/useClinicalDocuments";
import { CreateDocumentModal } from "@/presentation/modules/document/components/CreateDocumentModal";
import { ClinicalDocumentsTable } from "@/presentation/modules/document/components/ClinicalDocumentsTable";
import { DOCUMENT_TYPES } from "@/presentation/modules/document/registry/documentRegistry";
import {
  formatEvolutionDateRange,
  getRecentEvolutionDateRange,
  type EvolutionDateRange,
} from "@/presentation/modules/evolution/utils/dateRange";
import "@/presentation/modules/evolution/pages/EvolutionsPage.css";
import "./DocumentsPage.css";
import type {
  ClinicalDocumentListItem,
  DocumentFilters,
  DocumentStatus,
  DocumentType,
  PaginatedResult,
} from "@/domain/modules/document/models/ClinicalDocument";

type TypeFilter = DocumentType | "ALL";
type StatusFilter = DocumentStatus | "ALL";

const RECENT_PAGE_SIZE = 8;
const RECENT_FETCH_LIMIT = 1000;
const ADVANCED_PAGE_SIZE = 10;
const recentRange = getRecentEvolutionDateRange();

function isDateRangeValid(startDate: string, endDate: string, search: string) {
  if (!startDate && !endDate) {
    if (!search.trim()) {
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
  const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (!search.trim() && diffDays > 31) {
    return { valid: false, message: "Sin término de búsqueda, el rango máximo permitido es de 31 días." };
  }
  return { valid: true, message: "" };
}

function buildPresetRange(daysBack: number): EvolutionDateRange {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - daysBack);
  const pad = (v: number) => `${v}`.padStart(2, "0");
  const toInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { startDate: toInput(startDate), endDate: toInput(endDate) };
}

const TYPE_SELECT_OPTIONS = [
  { value: "ALL", label: "Todos los tipos" },
  ...DOCUMENT_TYPES.map((d) => ({ value: d.type, label: d.shortLabel, description: d.label })),
];

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string; icon: string; caption: string }> = [
  { value: "ALL", label: "Todas", icon: "icon-table-solid", caption: "Sin filtro" },
  { value: "ABIERTA", label: "Abiertas", icon: "icon-note-solid", caption: "Registros activos" },
  { value: "EN_PROCESO", label: "En proceso", icon: "icon-calendar-solid", caption: "Atención en curso" },
  { value: "CERRADA", label: "Cerradas", icon: "icon-lock-solid", caption: "Proceso finalizado" },
];

export function DocumentsPage() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // ── Recent tab ──
  const [recentPage, setRecentPage] = useState(1);
  const [recentStatusFilter, setRecentStatusFilter] = useState<StatusFilter>("ALL");
  const [recentTypeFilter, setRecentTypeFilter] = useState<TypeFilter>("ALL");
  const [recentSearchInput, setRecentSearchInput] = useState("");
  const [recentSearchApplied, setRecentSearchApplied] = useState("");

  const recentFilters = useMemo<DocumentFilters>(
    () => ({ startDate: recentRange.startDate, page: 1, limit: RECENT_FETCH_LIMIT }),
    [],
  );
  const recentQuery = useClinicalDocuments(recentFilters);

  const recentFilteredItems = useMemo<ClinicalDocumentListItem[]>(() => {
    if (!recentQuery.data) return [];
    const search = recentSearchApplied.toLowerCase();
    return recentQuery.data.data.filter((item) => {
      if (recentStatusFilter !== "ALL" && item.status !== recentStatusFilter) return false;
      if (recentTypeFilter !== "ALL" && item.documentType !== recentTypeFilter) return false;
      if (search) {
        const haystack = [item.patientName, item.patientIdNumber].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }, [recentQuery.data, recentStatusFilter, recentTypeFilter, recentSearchApplied]);

  const recentTotal = recentFilteredItems.length;
  const recentTotalPages = Math.max(1, Math.ceil(recentTotal / RECENT_PAGE_SIZE));

  useEffect(() => {
    if (recentPage > recentTotalPages) setRecentPage(recentTotalPages);
  }, [recentPage, recentTotalPages]);

  const recentResult = useMemo<PaginatedResult<ClinicalDocumentListItem> | undefined>(() => {
    if (!recentQuery.data) return undefined;
    const start = (recentPage - 1) * RECENT_PAGE_SIZE;
    return {
      data: recentFilteredItems.slice(start, start + RECENT_PAGE_SIZE),
      total: recentTotal,
      page: recentPage,
      limit: RECENT_PAGE_SIZE,
    };
  }, [recentFilteredItems, recentTotal, recentPage, recentQuery.data]);

  const activeStatusLabel =
    STATUS_FILTERS.find((s) => s.value === recentStatusFilter)?.label ?? "Todas";

  // ── Advanced tab ──
  const [searchInput, setSearchInput] = useState("");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [advancedType, setAdvancedType] = useState<TypeFilter>("ALL");
  const [advancedPage, setAdvancedPage] = useState(1);
  const [applied, setApplied] = useState<{ search: string; startDate: string; endDate: string } | null>(null);

  const advancedEnabled = Boolean(applied && (applied.search.trim() || (applied.startDate && applied.endDate)));

  const advancedFilters = useMemo<DocumentFilters>(
    () => ({
      search: applied?.search || undefined,
      startDate: applied?.startDate || undefined,
      endDate: applied?.endDate || undefined,
      documentType: advancedType === "ALL" ? undefined : advancedType,
      page: advancedPage,
      limit: ADVANCED_PAGE_SIZE,
    }),
    [applied, advancedType, advancedPage],
  );
  const advancedQuery = useClinicalDocuments(advancedFilters, { enabled: advancedEnabled });

  const applyAdvanced = (start = draftStartDate, end = draftEndDate) => {
    const validation = isDateRangeValid(start, end, searchInput);
    if (!validation.valid) {
      addToast({ type: "warning", message: validation.message });
      return;
    }
    setAdvancedPage(1);
    setApplied({ search: searchInput.trim(), startDate: start, endDate: end });
  };

  const applyPreset = (range: EvolutionDateRange) => {
    setDraftStartDate(range.startDate);
    setDraftEndDate(range.endDate);
    applyAdvanced(range.startDate, range.endDate);
  };

  const clearAdvanced = () => {
    setSearchInput("");
    setDraftStartDate("");
    setDraftEndDate("");
    setApplied(null);
    setAdvancedPage(1);
  };

  const typeFilterSelect = (
    value: TypeFilter,
    onChange: (v: TypeFilter) => void,
    width: "sm" | "md" | "lg" | "full" = "md",
    className?: string,
  ) => (
    <WcSelect
      value={value}
      onChange={(v) => onChange(v as TypeFilter)}
      options={TYPE_SELECT_OPTIONS}
      width={width}
      className={className}
      ariaLabel="Filtrar por tipo de documento"
    />
  );

  const recentTab = (
    <div className="evolutions-recent">
      <div className="evolutions-recent-filter-layout">
        <section className="card evolutions-recent-filter-panel">
          <div
            className="evolutions-recent-filter-panel__header"
            style={{ flexDirection: "row", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}
          >
            <h4 className="evolutions-recent-filter-panel__title">Filtrar resultados</h4>
            {typeFilterSelect(
              recentTypeFilter,
              (v) => {
                setRecentPage(1);
                setRecentTypeFilter(v);
              },
              "sm",
              "documents-type-filter--compact",
            )}
          </div>
          <div className="evolutions-recent-filter-panel__controls">
            <div className="evolutions-recent-filter-panel__actions">
              {STATUS_FILTERS.map((card) => (
                <WcButton
                  key={card.value}
                  variant={recentStatusFilter === card.value ? "primary" : "terciary"}
                  className="evolutions-recent-filter-panel__button"
                  onClick={() => {
                    setRecentPage(1);
                    setRecentStatusFilter(card.value);
                  }}
                  aria-pressed={recentStatusFilter === card.value}
                >
                  <span className="evolutions-recent-filter-panel__button-content">
                    <Icon name={card.icon} size={14} />
                    <span className="evolutions-recent-filter-panel__button-label">{card.label}</span>
                  </span>
                </WcButton>
              ))}
            </div>
            <WcSearchInput
              value={recentSearchInput}
              onValueChange={setRecentSearchInput}
              placeholder="Buscar paciente"
              wrapperClassName="evolutions-recent-filter-panel__search"
              aria-label="Buscar en resultados cargados"
              showSubmitButton
              submitButtonLabel="Buscar"
              onSubmit={() => {
                setRecentPage(1);
                setRecentSearchApplied(recentSearchInput.trim());
              }}
              onClear={() => {
                setRecentPage(1);
                setRecentSearchInput("");
                setRecentSearchApplied("");
              }}
              submitButtonDisabled={recentSearchInput.trim() === recentSearchApplied}
            />
          </div>
        </section>

        <aside className="evolutions-recent-status-card" aria-live="polite">
          <p className="evolutions-recent-status-card__title">Total</p>
          <div className="evolutions-recent-status-card__value">{recentTotal}</div>
          <p className="evolutions-recent-status-card__state">{activeStatusLabel}</p>
        </aside>
      </div>

      <ClinicalDocumentsTable
        result={recentResult}
        isLoading={recentQuery.isFetching}
        emptyMessage="No se encontraron documentos recientes con esos filtros."
        onPageChange={setRecentPage}
      />
    </div>
  );

  const activeDateLabel =
    applied?.startDate && applied?.endDate
      ? formatEvolutionDateRange({ startDate: applied.startDate, endDate: applied.endDate })
      : "Sin filtro de fechas";

  const advancedTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <section
        className="card"
        style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <h3 style={{ margin: 0 }}>Consulta avanzada</h3>
          <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
            Busca documentos por cédula, nombre, apellido o HC, por tipo o por rango de fechas. Sin
            término de búsqueda, el rango máximo es de 31 días.
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
          {typeFilterSelect(advancedType, (v) => {
            setAdvancedPage(1);
            setAdvancedType(v);
          })}
          <div style={{ flex: "1 1 260px", minWidth: 0 }}>
            <WcSearchInput
              value={searchInput}
              onValueChange={setSearchInput}
              placeholder="Buscar por cédula, nombre, apellido o HC..."
              showSubmitButton
              submitButtonLabel="Buscar"
              onSubmit={() => applyAdvanced()}
              onClear={() => setSearchInput("")}
              disabled={advancedQuery.isFetching}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr)) auto", gap: "var(--space-3)", alignItems: "end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <label style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>Desde</label>
            <input type="date" className="input-field" value={draftStartDate} onChange={(e) => setDraftStartDate(e.target.value)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <label style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>Hasta</label>
            <input type="date" className="input-field" value={draftEndDate} onChange={(e) => setDraftEndDate(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <WcButton variant="terciary" onClick={clearAdvanced} disabled={advancedQuery.isFetching}>
              <Icon name="icon-restore" size={16} />
              Restablecer
            </WcButton>
            <WcButton variant="primary" onClick={() => applyAdvanced()} disabled={advancedQuery.isFetching}>
              Aplicar
            </WcButton>
          </div>
        </div>

        <div className="evolutions-advanced__presets">
          <span className="evolutions-advanced__presets-label">Acceso rápido:</span>
          <WcButton variant="terciary" onClick={() => applyPreset(buildPresetRange(6))}>Últimos 7 días</WcButton>
          <WcButton variant="terciary" onClick={() => applyPreset(buildPresetRange(14))}>Últimos 15 días</WcButton>
          <WcButton variant="terciary" onClick={() => applyPreset(buildPresetRange(30))}>Últimos 31 días</WcButton>
        </div>

        {advancedEnabled ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", color: "var(--color-text-secondary)", fontSize: "var(--font-size-xs)" }}>
            <span style={{ padding: "var(--space-1) var(--space-2)", borderRadius: "var(--radius-full)", border: "1px solid var(--color-border)" }}>
              {applied?.search ? `Búsqueda: ${applied.search}` : "Sin búsqueda textual"}
            </span>
            <span style={{ padding: "var(--space-1) var(--space-2)", borderRadius: "var(--radius-full)", border: "1px solid var(--color-border)" }}>
              {activeDateLabel}
            </span>
          </div>
        ) : null}
      </section>

      {advancedEnabled ? (
        <ClinicalDocumentsTable
          result={advancedQuery.data}
          isLoading={advancedQuery.isFetching}
          emptyMessage="No se encontraron documentos con los filtros aplicados."
          onPageChange={setAdvancedPage}
        />
      ) : (
        <div className="evolutions-advanced__initial-state">
          <div className="evolutions-advanced__initial-icon">
            <Icon name="icon-file-search" size={28} />
          </div>
          <h4 className="evolutions-advanced__initial-title">Realiza una consulta para ver resultados</h4>
          <p className="evolutions-advanced__initial-description">
            Usa la búsqueda, selecciona un rango de fechas, o elige una de las opciones rápidas.
          </p>
        </div>
      )}
    </div>
  );

  const tabs = [
    { name: "Últimas 48 horas", icon: <Icon name="icon-file-time" size={16} />, content: recentTab },
    { name: "Consulta avanzada", icon: <Icon name="icon-file-search" size={16} />, content: advancedTab },
  ];

  return (
    <div style={{ padding: "var(--space-8)", maxWidth: "calc(var(--space-10) * 32.5)", margin: "0 auto" }}>
      <WcModuleHeader
        moduleName="Módulo clínico"
        moduleIcon="icon-medical-evolution"
        title="Documentos Clínicos"
        description="Supervisa los documentos clínicos (Formulario 008 y 005) creados o modificados recientemente, o realiza una consulta avanzada por tipo, paciente, historia clínica o rango de fechas."
      >
        <WcButton variant="primary" onClick={() => navigate("/historias-clinicas")}>
          <Icon name="icon-clinical-history" size={14} />
          Historias Clínicas
        </WcButton>
        <WcButton variant="terciary" onClick={() => setIsCreateModalOpen(true)}>
          <Icon name="icon-add-file" size={14} />
          Nuevo Documento
        </WcButton>
      </WcModuleHeader>

      <WcTabsFolder tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      <CreateDocumentModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <PatientDetailsDrawer />
    </div>
  );
}
