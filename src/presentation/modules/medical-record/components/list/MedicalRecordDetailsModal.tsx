import { useEffect, useRef } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { useOrganizationConfig } from "@/presentation/modules/medical-record/hooks/useOrganizationConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { canEditMedicalRecord } from "@/presentation/core/security/medicalRecordPermissions";
import type { MedicalRecordListItem } from "@/domain/modules/medical-record/models/MedicalRecord";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { useCreateEvolution } from "@/presentation/modules/evolution/hooks/useEvolutions";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useConfirmDialog } from "@/presentation/modules/shared/components/ui/useConfirmDialog";

interface MedicalRecordDetailsModalProps {
  record: MedicalRecordListItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MedicalRecordDetailsModal({
  record,
  isOpen,
  onClose,
}: MedicalRecordDetailsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const { data: config } = useOrganizationConfig();
  const { setSelectedPatientId } = usePatientStore();
  const { user } = useAuth();
  const createEvolution = useCreateEvolution();
  const { addToast } = useToastStore();
  const { confirm, DialogComponent } = useConfirmDialog();

  const canEdit = canEditMedicalRecord(user?.role);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleNewEvolution = async () => {
    if (!record) {
      return;
    }

    const isConfirmed = await confirm({
      title: "Nueva Evolución Médica",
      message:
        "Se creará un borrador de evolución médica para este paciente y podrás continuar editándolo inmediatamente.",
      confirmText: "Crear Evolución",
      cancelText: "Cancelar",
      type: "primary",
    });

    if (!isConfirmed) {
      return;
    }

    try {
      const now = new Date();
      const payload = {
        medicalRecordId: record.id,
        notifyPolice: false,
        requiresPoliceCustody: false,
        alcoholicBreath: false,
        deathInEmergency: false,
        attentionDate: now.toISOString().split("T")[0],
        attentionTime: now.toTimeString().slice(0, 5),
      };

      const newEvolution = await createEvolution.mutateAsync(payload);
      addToast({ type: "success", message: "Borrador de evolución creado exitosamente." });
      onClose();
      navigate(`/pacientes/${record.patientId}/historia/evoluciones/${newEvolution.id}`);
    } catch (error) {
      console.error("Failed to create new evolution", error);
      addToast({ type: "error", message: "Ocurrió un error al crear la evolución médica." });
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="mr-details-modal"
      style={{
        padding: "0",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--color-surface)",
        color: "var(--color-text)",
        maxWidth: "520px",
        width: "90vw",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        margin: "auto",
        overflow: "hidden",
      }}
    >
      {record && (
        <>
          <div
            style={{
              padding: "var(--space-6)",
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-bg)",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <div>
                <h3 style={{ margin: 0, fontWeight: 700, color: "var(--color-text)" }}>
                  {config?.institutionName || "Institucion de Salud"}
                </h3>
                <p
                  style={{
                    margin: 0,
                    marginTop: "var(--space-1)",
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {config?.operationalUnit}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                  padding: "var(--space-1)",
                  display: "flex",
                }}
                aria-label="Cerrar modal"
              >
                <Icon name="icon-x" size={20} />
              </button>
            </div>
          </div>

          <div
            style={{
              padding: "var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-5)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Nro. Historia
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "1.125rem",
                    fontWeight: 500,
                    color: "var(--color-text)",
                  }}
                >
                  {record.patientIdNumber}
                </span>
              </div>
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Estado
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "2px 10px",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    backgroundColor: record.isActive
                      ? "var(--color-success-bg, rgba(34,197,94,0.1))"
                      : "var(--color-danger-bg, rgba(239,68,68,0.1))",
                    color: record.isActive
                      ? "var(--color-success, #16a34a)"
                      : "var(--color-danger, #dc2626)",
                  }}
                >
                  {record.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "var(--space-1)",
                }}
              >
                Paciente
              </span>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "var(--color-bg)",
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-md, 8px)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <span style={{ fontWeight: 500, color: "var(--color-text)" }}>
                  {record.patientName}
                </span>
                <WcButton
                  variant="terciary"
                  onClick={() => {
                    onClose();
                    setSelectedPatientId(record.patientId);
                  }}
                >
                  <Icon name="icon-card-info" size={16} />
                  Ver Detalle
                </WcButton>
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                backgroundColor: "var(--color-bg)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md, 8px)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                }}
              >
                {record.evolutionCount}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                Evoluciones
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-3)",
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
              }}
            >
              <div>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-1)",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "2px",
                  }}
                >
                  <Icon name="icon-calendar-user" size={12} />
                  Creado
                </span>
                <span style={{ color: "var(--color-text)", fontWeight: 500 }}>
                  {new Date(record.createdAt).toLocaleDateString()}
                </span>
                {record.createdByName && (
                  <span style={{ display: "block", fontSize: "0.75rem" }}>
                    por {record.createdByName}
                  </span>
                )}
              </div>
              <div>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-1)",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "2px",
                  }}
                >
                  <Icon name="icon-calendar-time" size={12} />
                  Ultima edicion
                </span>
                <span style={{ color: "var(--color-text)", fontWeight: 500 }}>
                  {new Date(record.updatedAt).toLocaleDateString()}
                </span>
                {record.updatedByName && (
                  <span style={{ display: "block", fontSize: "0.75rem" }}>
                    por {record.updatedByName}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-3)", paddingTop: "var(--space-2)" }}>
              <WcButton
                variant="terciary"
                onClick={() => navigate(`/pacientes/${record.patientId}/historia`)}
                style={{ width: "100%" }}
              >
                <Icon name="icon-open-folder" size={18} />
                Ver Historia Completa
              </WcButton>

              {canEdit && (
                <WcButton
                  variant="primary"
                  disabled={createEvolution.isPending}
                  onClick={handleNewEvolution}
                  style={{ width: "100%" }}
                >
                  <Icon name="icon-add-file" size={18} />
                  {createEvolution.isPending ? "Creando..." : "Nueva Evolución Médica"}
                </WcButton>
              )}
            </div>
          </div>
        </>
      )}

      {DialogComponent}

      <style>
        {`
          .mr-details-modal::backdrop {
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
          }

          @media (max-width: 640px) {
            .mr-details-modal {
              width: 98vw;
              max-width: 100%;
            }
          }
        `}
      </style>
    </dialog>
  );
}
