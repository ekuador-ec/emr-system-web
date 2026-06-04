import { useEffect, useState } from "react";
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { WcInput } from "@/presentation/modules/shared/components/ui/webcomponents/Inputs/WcInput";
import { WcTextareaExpand } from "@/presentation/modules/shared/components/ui/webcomponents/Inputs/wcTextareaExpand";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import {
  useCreatePrescription,
  useUpdatePrescription,
} from "@/presentation/modules/prescription/hooks/usePrescriptions";
import {
  addDaysToDate,
  buildDefaultPrescriptionValues,
  validatePrescription,
  type PrescriptionFormValues,
} from "@/presentation/modules/prescription/schemas/prescription.schema";
import type { MedicalPrescription } from "@/domain/modules/prescription/models/MedicalPrescription";
import type { DocumentType } from "@/domain/modules/document/models/ClinicalDocument";
import { PrescriptionCie10Picker } from "./PrescriptionCie10Picker";
import "./PrescriptionFormModal.css";

interface PrescriptionFormModalProps {
  isOpen: boolean;
  medicalRecordId: string;
  sourceDocumentType: DocumentType;
  sourceDocumentId: string;
  editingPrescription: MedicalPrescription | null;
  onClose: () => void;
  onSaved: (prescription: MedicalPrescription) => void;
}

function toFormValues(prescription: MedicalPrescription): PrescriptionFormValues {
  return {
    issueDate: prescription.issueDate,
    validityDate: prescription.validityDate ?? addDaysToDate(prescription.issueDate, 3),
    allergies: prescription.allergies ?? "",
    rpText: prescription.rpText ?? "",
    indicationsText: prescription.indicationsText ?? "",
    diagnoses: prescription.diagnoses.map((diagnosis) => ({
      cie10Id: diagnosis.cie10Id,
      cie10Code: diagnosis.cie10Code,
      cie10Description: diagnosis.cie10Description,
    })),
  };
}

export function PrescriptionFormModal({
  isOpen,
  medicalRecordId,
  sourceDocumentType,
  sourceDocumentId,
  editingPrescription,
  onClose,
  onSaved,
}: PrescriptionFormModalProps) {
  const { addToast } = useToastStore();
  const createPrescription = useCreatePrescription();
  const updatePrescription = useUpdatePrescription();

  const [values, setValues] = useState<PrescriptionFormValues>(buildDefaultPrescriptionValues);

  useEffect(() => {
    if (!isOpen) return;
    setValues(editingPrescription ? toFormValues(editingPrescription) : buildDefaultPrescriptionValues());
  }, [isOpen, editingPrescription]);

  const isSaving = createPrescription.isPending || updatePrescription.isPending;

  const handleIssueDateChange = (next: string) => {
    setValues((prev) => {
      const previousDefault = addDaysToDate(prev.issueDate, 3);
      const validityIsDefault = prev.validityDate === previousDefault;
      return {
        ...prev,
        issueDate: next,
        validityDate: validityIsDefault ? addDaysToDate(next, 3) : prev.validityDate,
      };
    });
  };

  const handleSave = async () => {
    const errors = validatePrescription(values);
    if (errors.length > 0) {
      addToast({ type: "warning", message: errors[0] });
      return;
    }

    const payload = {
      issueDate: values.issueDate,
      validityDate: values.validityDate,
      allergies: values.allergies ?? null,
      rpText: values.rpText ?? null,
      indicationsText: values.indicationsText ?? null,
      diagnoses: values.diagnoses,
    };

    try {
      const result = editingPrescription
        ? await updatePrescription.mutateAsync({ id: editingPrescription.id, payload })
        : await createPrescription.mutateAsync({
            medicalRecordId,
            sourceDocumentType,
            sourceDocumentId,
            ...payload,
          });
      addToast({ type: "success", message: "Borrador de receta guardado correctamente." });
      onSaved(result);
    } catch (error) {
      addToast({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo guardar la receta.",
      });
    }
  };

  const footer = (
    <div className="prescription-form__footer">
      <WcButton variant="secondary" onClick={onClose} disabled={isSaving}>
        Cancelar
      </WcButton>
      <WcButton variant="primary" onClick={handleSave} disabled={isSaving}>
        <Icon name="icon-check" size={16} />
        {editingPrescription ? "Guardar cambios" : "Guardar borrador"}
      </WcButton>
    </div>
  );

  return (
    <WcModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPrescription ? "Editar receta médica" : "Nueva receta médica"}
      subtitle="Borrador editable. El número y la firma se asignan al emitir."
      maxWidth="min(820px, 96vw)"
      footer={footer}
      disableBackdropClick
    >
      <div className="prescription-form">
        <div className="prescription-form__row">
          <label className="prescription-form__field">
            <span className="prescription-form__label">Fecha de registro</span>
            <WcInput
              type="date"
              value={values.issueDate}
              onChange={(e) => handleIssueDateChange(e.target.value)}
            />
          </label>
          <label className="prescription-form__field">
            <span className="prescription-form__label">Fecha de vigencia</span>
            <WcInput
              type="date"
              value={values.validityDate}
              min={values.issueDate}
              onChange={(e) => setValues((prev) => ({ ...prev, validityDate: e.target.value }))}
            />
          </label>
        </div>

        <div className="prescription-form__field">
          <span className="prescription-form__label">Diagnósticos CIE-10</span>
          <PrescriptionCie10Picker
            value={values.diagnoses}
            onChange={(diagnoses) => setValues((prev) => ({ ...prev, diagnoses }))}
          />
        </div>

        <label className="prescription-form__field">
          <span className="prescription-form__label">Alergias</span>
          <WcInput
            type="text"
            placeholder="Ej. Penicilina, AINEs (o 'No refiere')"
            value={values.allergies ?? ""}
            onChange={(e) => setValues((prev) => ({ ...prev, allergies: e.target.value }))}
          />
        </label>

        <div className="prescription-form__row prescription-form__row--editors">
          <div className="prescription-form__field">
            <span className="prescription-form__label">Prescripción Médica (Rp)</span>
            <WcTextareaExpand
              label="Prescripción Médica (Rp)"
              placeholder="Detalle de medicamentos, dosis y vía..."
              value={values.rpText ?? ""}
              minRows={6}
              maxRows={12}
              expandTabIndex={-1}
              onChange={(rpText) => setValues((prev) => ({ ...prev, rpText }))}
            />
          </div>

          <div className="prescription-form__field">
            <span className="prescription-form__label">Indicaciones</span>
            <WcTextareaExpand
              label="Indicaciones"
              placeholder="Indicaciones, recomendaciones y advertencias para el paciente..."
              value={values.indicationsText ?? ""}
              minRows={6}
              maxRows={12}
              expandTabIndex={-1}
              onChange={(indicationsText) => setValues((prev) => ({ ...prev, indicationsText }))}
            />
          </div>
        </div>
      </div>
    </WcModal>
  );
}
