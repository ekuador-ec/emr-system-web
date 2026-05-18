import type { MessagingContact } from "@/domain/modules/messaging/models/Conversation";
import type { PresenceStatus } from "@/domain/modules/users/models/User";

export type PresenceByUserId = Map<string, PresenceStatus>;

export function buildPresenceMap(
  contacts: MessagingContact[] | undefined,
): PresenceByUserId {
  const map: PresenceByUserId = new Map();
  if (!contacts) return map;
  contacts.forEach((contact) => {
    map.set(contact.id, contact.presenceStatus);
  });
  return map;
}

export function presenceOf(
  map: PresenceByUserId,
  userId: string | null | undefined,
): PresenceStatus {
  if (!userId) return "offline";
  return map.get(userId) ?? "offline";
}
