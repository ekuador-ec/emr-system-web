import { useCallback } from "react";
import { useEvolution } from "@/presentation/modules/evolution/hooks/useEvolutions";
import { AiAssistantTrigger } from "@/presentation/modules/ai/components/AiAssistantTrigger";
import { AiAssistantModal } from "@/presentation/modules/ai/components/AiAssistantModal";
import { anonymizeEvolution } from "@/presentation/modules/ai/utils/anonymizeEvolution";

interface EvolutionAiAssistantProps {
  evolutionId: string;
}

export function EvolutionAiAssistant({ evolutionId }: EvolutionAiAssistantProps) {
  const { data: evolution } = useEvolution(evolutionId);

  const target = evolution
    ? {
        kind: "evolution" as const,
        entityId: evolution.id,
        label: "Evolucion medica",
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
