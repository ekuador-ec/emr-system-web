import { useEffect, useRef, useState } from "react";
import { useMedicalRecordStore } from "@/presentation/modules/medical-record/stores/useMedicalRecordStore";
import { useMedicalRecords } from "@/presentation/modules/medical-record/hooks/useMedicalRecord";
import { MedicalRecordsList } from "@/presentation/modules/medical-record/components/list/MedicalRecordsList";
import { MedicalRecordsSearchFilters } from "@/presentation/modules/medical-record/components/list/MedicalRecordsSearchFilters";
import { OrganizationConfigModal } from "@/presentation/modules/medical-record/components/list/OrganizationConfigModal";
import { MedicalRecordDetailsModal } from "@/presentation/modules/medical-record/components/list/MedicalRecordDetailsModal";
import { CreateMedicalRecordModal } from "@/presentation/modules/medical-record/components/list/CreateMedicalRecordModal";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { canChangeMedicalRecordStatus } from "@/presentation/core/security/medicalRecordPermissions";
import type { MedicalRecordListItem } from "@/domain/modules/medical-record/models/MedicalRecord";
import { PatientDetailsDrawer } from "@/presentation/modules/patient/components/Patients/PatientDetailsDrawer";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import {
  formatMedicalRecordDateRange,
  getRecentMedicalRecordDateRange,
} from "@/presentation/modules/medical-record/utils/dateRange";

export function MedicalRecordsPage() {
  const { filters, setFilters } = useMedicalRecordStore();
  const { data: records, isLoading, isError, error } = useMedicalRecords(filters);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordListItem | null>(null);
  const { addToast } = useToastStore();
  const { user } = useAuth();
  const validationToastShown = useRef(false);

  const canAdmin = canChangeMedicalRecordStatus(user?.role);
  const validationMessage = error?.message.includes("31 días") ?? false;
  const totalRecords = records?.total ?? 0;
  const activeSearch = filters.search?.trim();
  const activeDateRange =
    filters.startDate && filters.endDate
      ? formatMedicalRecordDateRange({ startDate: filters.startDate, endDate: filters.endDate })
      : formatMedicalRecordDateRange(getRecentMedicalRecordDateRange());
  const summaryMessage = activeSearch
    ? `Mostrando ${totalRecords} resultado${totalRecords === 1 ? "" : "s"} para "${activeSearch}".`
    : `Mostrando ${totalRecords} historia${totalRecords === 1 ? "" : "s"} clínica${totalRecords === 1 ? "" : "s"} editada${totalRecords === 1 ? "" : "s"} entre ${activeDateRange}.`;

  useEffect(() => {
    if (validationMessage && !validationToastShown.current) {
      validationToastShown.current = true;
      addToast({
        type: "warning",
        message: "El rango máximo permitido para esta consulta es de 31 días por fecha de edición.",
      });
    }

    if (!validationMessage) {
      validationToastShown.current = false;
    }
  }, [addToast, validationMessage]);

  const handleResetToRecentRange = () => {
    const recentRange = getRecentMedicalRecordDateRange();
    setFilters({
      startDate: recentRange.startDate,
      endDate: recentRange.endDate,
      page: 1,
    });
  };

  return (
    <div style={{ padding: "var(--space-8)", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-6)",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "var(--space-1)" }}>Historias Clínicas</h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            Consulta y administra las historias clínicas del sistema.
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <WcButton variant="primary" onClick={() => setIsCreateOpen(true)}>
            <Icon name="icon-add-folder" size={20} />
            Crear Historia Clínica
          </WcButton>
          {canAdmin && (
            <WcButton variant="terciary" onClick={() => setIsConfigOpen(true)}>
              <Icon name="icon-settings" size={20} />
              Configurar Encabezado
            </WcButton>
          )}
        </div>
      </div>

      <MedicalRecordsSearchFilters />

      {!isError && (
        <div
          style={{
            marginTop: "var(--space-4)",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-sm)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text)" }}>
            Resultado actual:
          </span>
          {summaryMessage}
        </div>
      )}

      <div style={{ marginTop: "var(--space-6)" }}>
        {isLoading ? (
          <div className="card" style={{ padding: "var(--space-8)", textAlign: "center" }}>
            Cargando historias clinicas...
          </div>
        ) : isError && validationMessage ? (
          <div
            className="card"
            style={{
              padding: "var(--space-8)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: 0 }}>El rango seleccionado es demasiado amplio</h3>
            <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
              La consulta por fecha de edición admite un máximo de 31 días. Ajusta el rango o vuelve
              al periodo reciente por defecto.
            </p>
            <WcButton variant="primary" onClick={handleResetToRecentRange}>
              Volver a últimos 2 días
            </WcButton>
          </div>
        ) : isError ? (
          <div
            className="card"
            style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-danger)" }}
          >
            Error al cargar historias: {error.message}
          </div>
        ) : (
          <MedicalRecordsList
            result={records}
            onSelectRecord={(record) => setSelectedRecord(record)}
          />
        )}
      </div>

      <OrganizationConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      <MedicalRecordDetailsModal
        record={selectedRecord}
        isOpen={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
      />

      <CreateMedicalRecordModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <PatientDetailsDrawer />
    </div>
  );
}
