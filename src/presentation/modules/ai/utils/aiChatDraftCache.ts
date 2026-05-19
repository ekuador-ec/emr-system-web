import {
  encryptedGet,
  encryptedRemove,
  encryptedSet,
  registerDraftPrefix,
  type DraftCacheEntry,
} from "@/infrastructure/core/draftCache";

const AI_CHAT_DRAFT_PREFIX = "emr:ai-chat-draft:";

registerDraftPrefix(AI_CHAT_DRAFT_PREFIX);

function buildKey(conversationId: string): string {
  return `${AI_CHAT_DRAFT_PREFIX}${conversationId}`;
}

export async function saveAiChatDraft(conversationId: string, content: string): Promise<void> {
  if (!conversationId) return;
  if (!content.trim()) {
    encryptedRemove(buildKey(conversationId));
    return;
  }
  await encryptedSet(buildKey(conversationId), { content });
}

export async function loadAiChatDraft(
  conversationId: string,
): Promise<DraftCacheEntry<{ content: string }> | null> {
  if (!conversationId) return null;
  return encryptedGet<{ content: string }>(buildKey(conversationId));
}

export function clearAiChatDraft(conversationId: string): void {
  if (!conversationId) return;
  encryptedRemove(buildKey(conversationId));
}
