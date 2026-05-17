export type AiSummaryKind = "medical_record" | "evolution";
export type AiModelPreference = "deepseek" | "auto";
export type AiProviderName = "deepseek" | "openrouter" | "mock";

export interface AiSummary {
  id: string;
  kind: AiSummaryKind;
  entityId: string;
  promptVersion: string;
  provider: AiProviderName;
  model: string;
  content: string;
  tokensInput: number | null;
  tokensOutput: number | null;
  createdBy: string;
  createdAt: string;
}

export interface GenerateAiSummaryResult {
  summary: AiSummary;
  cached: boolean;
}
