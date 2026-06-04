import { useState } from "react";
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { WcStatusBadge } from "@/presentation/modules/shared/components/ui/webcomponents/Badges/WcStatusBadge";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { formatShortDate } from "@/presentation/modules/evolution/utils/evolutionLabels";
import {
  usePrescriptionsByDocument,
  useEmitPrescription,
  useDeletePrescription,
} from "@/presentation/modules/prescription/hooks/usePrescriptions";
import { usePrescriptionUIStore } from "@/presentation/modules/prescription/stores/usePrescriptionUIStore";
import type { MedicalPrescription } from "@/domain/modules/prescription/models/MedicalPrescription";
import type { PrescriptionsManagerTarget } from "@/presentation/modules/prescription/stores/usePrescriptionUIStore";
import { PrescriptionFormModal } from "./form/PrescriptionFormModal";
import "./PrescriptionsManagerModal.css";

interface PrescriptionsManagerModalProps {
  target: PrescriptionsManagerTarget | null;
  onClose: () => void;
}

export function PrescriptionsManagerModal({ target, onClose }: PrescriptionsManagerModalProps) {
  const { addToast } = useToastStore();
  const { user } = useAuth();
  const { openReadOnlyPrescription } = usePrescriptionUIStore();
  const emitPrescription = useEmitPrescription();
  const deletePrescription = useDeletePrescription();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MedicalPrescription | null>(null);
  const [confirmEmitId, setConfirmEmitId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isOpen = target !== null;
  const listQuery = usePrescriptionsByDocument(
    target?.sourceDocumentType ?? null,
    target?.sourceDocumentId ?? null,
  );
  const prescriptions = listQuery.data ?? [];

  const isClinician = user?.role === "doctor" || user?.role === "admin";
  const parentOpen = Boolean(target) && !target!.parentClosed;
  const canCreate = isClinician && parentOpen;

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (prescription: MedicalPrescription) => {
    setEditing(prescription);
    setFormOpen(true);
  };

  const handlePreview = (prescription: MedicalPrescription) => {
    if (!target) return;
    openReadOnlyPrescription({
      prescriptionId: prescription.id,
      patientId: target.patientId,
      medicalRecordId: target.medicalRecordId,
    });
  };

  const handleEmit = async (prescription: MedicalPrescription) => {
    try {
      await emitPrescription.mutateAsync(prescription.id);
      addToast({ type: "success", message: "Receta emitida. Ya puede imprimirse y firmarse." });
      setConfirmEmitId(null);
    } catch (error) {
      addToast({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo emitir la receta.",
      });
    }
  };

  const handleDelete = async (prescription: MedicalPrescription) => {
    if (!target) return;
    try {
      await deletePrescription.mutateAsync({
        id: prescription.id,
        sourceDocumentType: target.sourceDocumentType,
        sourceDocumentId: target.sourceDocumentId,
      });
      addToast({ type: "success", message: "Borrador de receta eliminado." });
      setConfirmDeleteId(null);
    } catch (error) {
      addToast({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo eliminar la receta.",
      });
    }
  };

  const footer = (
    <div className="prescription-manager__footer">
      <WcButton variant="secondary" onClick={onClose}>
        Cerrar
      </WcButton>
      {canCreate ? (
        <WcButton variant="primary" onClick={handleNew}>
          <Icon name="icon-plus-solid" size={16} />
          Nueva receta
        </WcButton>
      ) : null}
    </div>
  );

  return (
    <>
      <WcModal
        isOpen={isOpen && !formOpen}
        onClose={onClose}
        title="Recetas médicas"
        subtitle="Recetas asociadas a este documento clínico."
        maxWidth="min(760px, 96vw)"
        footer={footer}
      >
        {listQuery.isLoading ? (
          <div className="prescription-manager__state">
            <Icon name="icon-refresh" size={20} className="spin" />
            <span>Cargando recetas…</span>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="prescription-manager__empty">
            <Icon name="icon-note-solid" size={28} />
            <p>Aún no hay recetas para este documento.</p>
            {canCreate ? (
              <WcButton variant="primary" onClick={handleNew}>
                <Icon name="icon-plus-solid" size={16} />
                Crear primera receta
              </WcButton>
            ) : null}
          </div>
        ) : (
          <ul className="prescription-manager__list">
            {prescriptions.map((prescription) => {
              const isDraft = prescription.status === "BORRADOR";
              const isAuthor = prescription.createdBy === user?.id;
              const canManage = isAuthor && isDraft && parentOpen;

              return (
                <li key={prescription.id} className="prescription-manager__item">
                  <div className="prescription-manager__item-main">
                    <div className="prescription-manager__item-head">
                      <span className="prescription-manager__item-number">
                        {prescription.prescriptionNumber ?? "Borrador sin emitir"}
                      </span>
                      <WcStatusBadge variant={isDraft ? "warning" : "success"} size="sm">
                        {isDraft ? "Borrador" : "Emitida"}
                      </WcStatusBadge>
                    </div>
                    <div className="prescription-manager__item-meta">
                      <span className="prescription-manager__meta-chip">
                        <Icon name="icon-calendar-solid" size={12} /> {formatShortDate(prescription.issueDate)}
                      </span>
                      <span className="prescription-manager__meta-chip">
                        Vigencia: {prescription.validityDate ? formatShortDate(prescription.validityDate) : "—"}
                      </span>
                      {prescription.createdByName ? (
                        <span className="prescription-manager__meta-author">
                          <Icon name="icon-user" size={12} /> {prescription.createdByName}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="prescription-manager__item-actions">
                    {confirmEmitId === prescription.id ? (
                      <>
                        <span className="prescription-manager__confirm-label">¿Emitir y bloquear?</span>
                        <WcButton
                          variant="primary"
                          onClick={() => handleEmit(prescription)}
                          disabled={emitPrescription.isPending}
                        >
                          Sí, emitir
                        </WcButton>
                        <WcButton variant="secondary" onClick={() => setConfirmEmitId(null)}>
                          Cancelar
                        </WcButton>
                      </>
                    ) : confirmDeleteId === prescription.id ? (
                      <>
                        <span className="prescription-manager__confirm-label">¿Eliminar borrador?</span>
                        <WcButton
                          variant="danger"
                          onClick={() => handleDelete(prescription)}
                          disabled={deletePrescription.isPending}
                        >
                          Sí, eliminar
                        </WcButton>
                        <WcButton variant="secondary" onClick={() => setConfirmDeleteId(null)}>
                          Cancelar
                        </WcButton>
                      </>
                    ) : (
                      <>
                        <WcButton variant="secondary" onClick={() => handlePreview(prescription)}>
                          <Icon name="icon-eye" size={16} />
                          Vista previa
                        </WcButton>
                        {canManage ? (
                          <>
                            <WcButton variant="terciary" onClick={() => handleEdit(prescription)}>
                              <Icon name="icon-edit" size={16} />
                              Editar
                            </WcButton>
                            <WcButton variant="primary" onClick={() => setConfirmEmitId(prescription.id)}>
                              <Icon name="icon-check" size={16} />
                              Emitir
                            </WcButton>
                            <WcButton variant="danger" onClick={() => setConfirmDeleteId(prescription.id)}>
                              <Icon name="icon-trash" size={16} />
                              Eliminar
                            </WcButton>
                          </>
                        ) : null}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </WcModal>

      {target ? (
        <PrescriptionFormModal
          isOpen={formOpen}
          medicalRecordId={target.medicalRecordId}
          sourceDocumentType={target.sourceDocumentType}
          sourceDocumentId={target.sourceDocumentId}
          editingPrescription={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => setFormOpen(false)}
        />
      ) : null}
    </>
  );
}
