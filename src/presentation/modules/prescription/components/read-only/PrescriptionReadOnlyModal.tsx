import { useState } from "react";
import { usePrescription } from "@/presentation/modules/prescription/hooks/usePrescriptions";
import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";
import { useMedicalRecordByPatient } from "@/presentation/modules/medical-record/hooks/useMedicalRecord";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import {
  PrescriptionReadOnlyView,
  type PrescriptionPrintLayout,
} from "./PrescriptionReadOnlyView";

interface PrescriptionReadOnlyModalProps {
  isOpen: boolean;
  prescriptionId: string | null;
  patientId: string | null;
  onClose: () => void;
}

const LAYOUT_OPTIONS: {
  value: PrescriptionPrintLayout;
  label: string;
  icon: string;
  hint: string;
}[] = [
  {
    value: "side",
    label: "Lado a lado (horizontal)",
    icon: "icon-table",
    hint: "Rp e Indicaciones en una sola hoja A4 horizontal. Ideal para recetas cortas.",
  },
  {
    value: "stacked",
    label: "Secuencial (vertical)",
    icon: "icon-patient-list",
    hint: "Hoja A4 vertical: Prescripción (Rp) arriba e Indicaciones abajo, separadas por la línea de corte. Continúa en otra página si es extensa. Ideal para recetas largas.",
  },
];

export function PrescriptionReadOnlyModal({
  isOpen,
  prescriptionId,
  patientId,
  onClose,
}: PrescriptionReadOnlyModalProps) {
  const [printLayout, setPrintLayout] = useState<PrescriptionPrintLayout>("side");

  const prescriptionQuery = usePrescription(prescriptionId);
  const patientQuery = usePatient(patientId ?? "");
  const recordQuery = useMedicalRecordByPatient(patientId ?? "", {
    enabled: Boolean(patientId),
  });

  const isLoading = prescriptionQuery.isLoading || patientQuery.isLoading || recordQuery.isLoading;
  const hasError = prescriptionQuery.isError || patientQuery.isError;

  const prescription = prescriptionQuery.data;
  const patient = patientQuery.data;
  const medicalRecord = recordQuery.data;

  const activeHint = LAYOUT_OPTIONS.find((option) => option.value === printLayout)?.hint;

  const footer = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-3)", width: "100%" }}>
      <WcButton variant="secondary" onClick={onClose}>
        Cerrar
      </WcButton>
      <WcButton variant="primary" onClick={() => window.print()} disabled={!prescription}>
        <Icon name="icon-generate-pdf" size={16} />
        Imprimir / PDF
      </WcButton>
    </div>
  );

  return (
    <WcModal
      isOpen={isOpen}
      onClose={onClose}
      title="Vista previa de receta médica"
      maxWidth="min(1240px, 97vw)"
      footer={footer}
    >
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-8)", color: "var(--color-text-secondary)", gap: "var(--space-2)" }}>
          <Icon name="icon-refresh" size={20} className="spin" />
          <span>Cargando receta…</span>
        </div>
      ) : hasError || !prescription || !patient ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--space-8)", gap: "var(--space-2)", color: "var(--color-danger, #b91c1c)", textAlign: "center" }}>
          <Icon name="icon-warning-solid" size={28} />
          <p style={{ margin: 0, fontWeight: 600 }}>No fue posible cargar la receta.</p>
        </div>
      ) : (
        <>
          <div className="rx-toolbar">
            <span className="rx-toolbar__label">Formato de impresión</span>
            <div className="rx-toolbar__options" role="group" aria-label="Formato de impresión">
              {LAYOUT_OPTIONS.map((option) => (
                <WcButton
                  key={option.value}
                  variant={printLayout === option.value ? "primary" : "secondary"}
                  onClick={() => setPrintLayout(option.value)}
                >
                  <Icon name={option.icon} size={16} />
                  {option.label}
                </WcButton>
              ))}
            </div>
            {activeHint ? <span className="rx-toolbar__hint">{activeHint}</span> : null}
          </div>

          <PrescriptionReadOnlyView
            prescription={prescription}
            patient={patient}
            medicalRecord={medicalRecord}
            printLayout={printLayout}
          />
        </>
      )}
    </WcModal>
  );
}
