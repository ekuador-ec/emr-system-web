import { AiApiClient } from "@/infrastructure/modules/ai/AiApiClient";
import { HttpAiServiceRepository } from "@/infrastructure/modules/ai/HttpAiServiceRepository";
import { GenerateAiSummaryUseCase } from "@/application/modules/ai/use-cases/GenerateAiSummaryUseCase";
import { GetLatestAiSummaryUseCase } from "@/application/modules/ai/use-cases/GetLatestAiSummaryUseCase";
import {
  DeleteAiConversationUseCase,
  GetAiConversationUseCase,
  ListAiConversationsUseCase,
  StartAiConversationUseCase,
  UpdateAiConversationPreferenceUseCase,
} from "@/application/modules/ai/use-cases/ConversationUseCases";
import { StreamAiChatMessageUseCase } from "@/application/modules/ai/use-cases/StreamAiChatMessageUseCase";

const baseUrl = import.meta.env.VITE_AI_SERVICE_URL as string | undefined;
const apiKey = import.meta.env.VITE_AI_SERVICE_API_KEY as string | undefined;

export const aiServiceConfigured = Boolean(baseUrl && apiKey);

const fallbackClient = new AiApiClient({
  baseUrl: baseUrl ?? "http://disabled.invalid",
  apiKey: apiKey ?? "disabled.disabled",
});

const aiClient = aiServiceConfigured
  ? new AiApiClient({ baseUrl: baseUrl!, apiKey: apiKey! })
  : fallbackClient;

export const aiServiceRepository = new HttpAiServiceRepository(aiClient);

export const generateAiSummaryUseCase = new GenerateAiSummaryUseCase(aiServiceRepository);
export const getLatestAiSummaryUseCase = new GetLatestAiSummaryUseCase(aiServiceRepository);
export const startAiConversationUseCase = new StartAiConversationUseCase(aiServiceRepository);
export const listAiConversationsUseCase = new ListAiConversationsUseCase(aiServiceRepository);
export const getAiConversationUseCase = new GetAiConversationUseCase(aiServiceRepository);
export const deleteAiConversationUseCase = new DeleteAiConversationUseCase(aiServiceRepository);
export const updateAiConversationPreferenceUseCase =
  new UpdateAiConversationPreferenceUseCase(aiServiceRepository);
export const streamAiChatMessageUseCase = new StreamAiChatMessageUseCase(aiServiceRepository);
