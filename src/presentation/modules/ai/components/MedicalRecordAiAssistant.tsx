import { useCallback } from "react";
import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";
import { useEvolutionsByMedicalRecord } from "@/presentation/modules/evolution/hooks/useEvolutions";
import { useMedicalRecordByPatient } from "@/presentation/modules/medical-record/hooks/useMedicalRecord";
import { AiAssistantTrigger } from "@/presentation/modules/ai/components/AiAssistantTrigger";
import { AiAssistantModal } from "@/presentation/modules/ai/components/AiAssistantModal";
import { anonymizeMedicalRecord } from "@/presentation/modules/ai/utils/anonymizeMedicalRecord";

interface MedicalRecordAiAssistantProps {
  patientId: string;
}

function buildConversationLabel(
  patient: { firstName: string; lastName: string; idNumber: string } | null,
  medicalRecord: { id: string } | null,
): string {
  if (patient) {
    return `HC ${patient.firstName} ${patient.lastName} - ${patient.idNumber}`;
  }
  if (medicalRecord) {
    return `HC ${medicalRecord.id.slice(0, 8)}`;
  }
  return "Historia clinica";
}

export function MedicalRecordAiAssistant({ patientId }: MedicalRecordAiAssistantProps) {
  const { data: medicalRecord } = useMedicalRecordByPatient(patientId);
  const { data: patient } = usePatient(patientId, { enabled: !!patientId });
  const { data: evolutions } = useEvolutionsByMedicalRecord(medicalRecord?.id ?? "");

  const label = buildConversationLabel(patient ?? null, medicalRecord ?? null);

  const target = medicalRecord
    ? {
        kind: "medical_record" as const,
        entityId: medicalRecord.id,
        label,
      }
    : null;

  const payloadBuilder = useCallback(() => {
    if (!medicalRecord || !patient) return null;
    const anonymized = anonymizeMedicalRecord(
      medicalRecord,
      patient,
      evolutions ?? [],
    );
    return anonymized as unknown as Record<string, unknown>;
  }, [medicalRecord, patient, evolutions]);

  return (
    <>
      <AiAssistantTrigger
        target={target}
        label="Resumir con IA"
        disabled={!medicalRecord || !patient}
      />
      <AiAssistantModal payloadBuilder={payloadBuilder} />
    </>
  );
}
