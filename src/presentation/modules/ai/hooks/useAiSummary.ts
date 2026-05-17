import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AiSummary,
  AiSummaryKind,
  GenerateAiSummaryResult,
} from "@/domain/modules/ai/models/Summary";
import type { GenerateSummaryInput } from "@/domain/modules/ai/repositories/AiServiceRepository";
import {
  aiServiceConfigured,
  generateAiSummaryUseCase,
  getLatestAiSummaryUseCase,
} from "@/infrastructure/modules/ai/config";

export const AI_QUERY_KEY = ["ai"] as const;
export const aiSummaryKey = (kind: AiSummaryKind, entityId: string) =>
  [...AI_QUERY_KEY, "summary", kind, entityId] as const;

export function useLatestAiSummary(kind: AiSummaryKind, entityId: string | null | undefined) {
  return useQuery({
    queryKey: aiSummaryKey(kind, entityId ?? ""),
    queryFn: (): Promise<AiSummary | null> => {
      if (!entityId) return Promise.resolve(null);
      return getLatestAiSummaryUseCase.execute(kind, entityId);
    },
    enabled: aiServiceConfigured && !!entityId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useGenerateAiSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateSummaryInput): Promise<GenerateAiSummaryResult> => {
      return generateAiSummaryUseCase.execute(input);
    },
    onSuccess: (result, variables) => {
      queryClient.setQueryData(
        aiSummaryKey(variables.kind, variables.entityId),
        result.summary,
      );
    },
  });
}
