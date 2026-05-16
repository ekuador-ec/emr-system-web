const EVENT_NAME = "floating-popover:opened";

export type FloatingPopoverId = "notifications" | "profile" | "quick-actions";

export function announceFloatingPopover(id: FloatingPopoverId): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<FloatingPopoverId>(EVENT_NAME, { detail: id }));
}

export function onFloatingPopoverOpened(
  ownId: FloatingPopoverId,
  onOtherOpened: () => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<FloatingPopoverId>).detail;
    if (detail && detail !== ownId) onOtherOpened();
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
