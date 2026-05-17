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

export function MedicalRecordAiAssistant({ patientId }: MedicalRecordAiAssistantProps) {
  const { data: medicalRecord } = useMedicalRecordByPatient(patientId);
  const { data: patient } = usePatient(patientId, { enabled: !!patientId });
  const { data: evolutions } = useEvolutionsByMedicalRecord(medicalRecord?.id ?? "");

  const target = medicalRecord
    ? {
        kind: "medical_record" as const,
        entityId: medicalRecord.id,
        label: "Historia clinica",
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
