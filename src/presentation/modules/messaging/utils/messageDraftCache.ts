import {
  clearByPrefix,
  encryptedGet,
  encryptedRemove,
  encryptedSet,
  registerDraftPrefix,
} from "@/infrastructure/core/draftCache";

const MESSAGE_DRAFT_PREFIX = "emr:msg-draft:";

registerDraftPrefix(MESSAGE_DRAFT_PREFIX);

function buildKey(conversationId: string): string {
  return `${MESSAGE_DRAFT_PREFIX}${conversationId}`;
}

export async function saveMessageDraft(conversationId: string, content: string): Promise<void> {
  if (!conversationId) return;
  if (!content || content.length === 0) {
    encryptedRemove(buildKey(conversationId));
    return;
  }
  await encryptedSet(buildKey(conversationId), { content });
}

export async function loadMessageDraft(conversationId: string): Promise<string> {
  if (!conversationId) return "";
  const entry = await encryptedGet<{ content: string }>(buildKey(conversationId));
  return entry?.payload?.content ?? "";
}

export function clearMessageDraft(conversationId: string): void {
  if (!conversationId) return;
  encryptedRemove(buildKey(conversationId));
}

export function clearAllMessageDrafts(): void {
  clearByPrefix(MESSAGE_DRAFT_PREFIX);
}
