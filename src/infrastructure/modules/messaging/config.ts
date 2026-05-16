import { supabase } from "@/infrastructure/core/supabaseClient";
import { SupabaseConversationRepository } from "@/infrastructure/modules/messaging/repositories/SupabaseConversationRepository";
import { SupabaseMessageRepository } from "@/infrastructure/modules/messaging/repositories/SupabaseMessageRepository";
import { ListConversationsUseCase } from "@/application/modules/messaging/use-cases/ListConversationsUseCase";
import { GetConversationUseCase } from "@/application/modules/messaging/use-cases/GetConversationUseCase";
import { OpenDirectConversationUseCase } from "@/application/modules/messaging/use-cases/OpenDirectConversationUseCase";
import { ListMessagesUseCase } from "@/application/modules/messaging/use-cases/ListMessagesUseCase";
import { SendMessageUseCase } from "@/application/modules/messaging/use-cases/SendMessageUseCase";
import {
  MarkConversationReadUseCase,
  ToggleConversationMuteUseCase,
} from "@/application/modules/messaging/use-cases/ConversationStateUseCases";
import { ListMessagingContactsUseCase } from "@/application/modules/messaging/use-cases/ListMessagingContactsUseCase";

export const conversationRepository = new SupabaseConversationRepository(supabase);
export const messageRepository = new SupabaseMessageRepository(supabase);

export const listConversationsUseCase = new ListConversationsUseCase(conversationRepository);
export const getConversationUseCase = new GetConversationUseCase(conversationRepository);
export const openDirectConversationUseCase = new OpenDirectConversationUseCase(conversationRepository);
export const markConversationReadUseCase = new MarkConversationReadUseCase(conversationRepository);
export const toggleConversationMuteUseCase = new ToggleConversationMuteUseCase(conversationRepository);
export const listMessagingContactsUseCase = new ListMessagingContactsUseCase(conversationRepository);

export const listMessagesUseCase = new ListMessagesUseCase(messageRepository);
export const sendMessageUseCase = new SendMessageUseCase(messageRepository);
