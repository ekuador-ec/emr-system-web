import { useCallback } from "react";
import { useEvolution } from "@/presentation/modules/evolution/hooks/useEvolutions";
import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";
import { useMedicalRecordByPatient } from "@/presentation/modules/medical-record/hooks/useMedicalRecord";
import { AiAssistantTrigger } from "@/presentation/modules/ai/components/AiAssistantTrigger";
import { AiAssistantModal } from "@/presentation/modules/ai/components/AiAssistantModal";
import { anonymizeEvolution } from "@/presentation/modules/ai/utils/anonymizeEvolution";

interface EvolutionAiAssistantProps {
  evolutionId: string;
  patientId?: string;
}

function buildLabel(
  patient: { firstName: string; lastName: string; idNumber: string } | null,
  attentionDate: string | null,
): string {
  const date = attentionDate ? attentionDate.slice(0, 10) : "";
  const prefix = patient
    ? `EM ${patient.firstName} ${patient.lastName} - ${patient.idNumber}`
    : "Evolucion medica";
  return date ? `${prefix} (${date})` : prefix;
}

export function EvolutionAiAssistant({ evolutionId, patientId }: EvolutionAiAssistantProps) {
  const { data: evolution } = useEvolution(evolutionId);
  const { data: medicalRecord } = useMedicalRecordByPatient(patientId ?? "", {
    enabled: !!patientId,
  });
  const resolvedPatientId = patientId ?? medicalRecord?.patientId ?? "";
  const { data: patient } = usePatient(resolvedPatientId, { enabled: !!resolvedPatientId });

  const label = buildLabel(patient ?? null, evolution?.attentionDate ?? null);

  const target = evolution
    ? {
        kind: "evolution" as const,
        entityId: evolution.id,
        label,
      }
    : null;

  const payloadBuilder = useCallback(() => {
    if (!evolution) return null;
    return anonymizeEvolution(evolution) as unknown as Record<string, unknown>;
  }, [evolution]);

  return (
    <>
      <AiAssistantTrigger
        target={target}
        label="Resumir EM con IA"
        disabled={!evolution}
      />
      <AiAssistantModal payloadBuilder={payloadBuilder} />
    </>
  );
}
