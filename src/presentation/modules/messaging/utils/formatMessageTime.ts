const TIME_FORMATTER = new Intl.DateTimeFormat("es-EC", {
  hour: "2-digit",
  minute: "2-digit",
});

const DAY_FORMATTER = new Intl.DateTimeFormat("es-EC", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function formatMessageTime(iso: string): string {
  try {
    return TIME_FORMATTER.format(new Date(iso));
  } catch {
    return "";
  }
}

export function formatRelativeShort(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;

  const sameDay =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate();
  if (sameDay) return TIME_FORMATTER.format(date);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    yesterday.getFullYear() === date.getFullYear() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getDate() === date.getDate();
  if (isYesterday) return "Ayer";

  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays < 7) {
    return new Intl.DateTimeFormat("es-EC", { weekday: "short" }).format(date);
  }

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function formatDayHeading(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate();
  if (sameDay) return "Hoy";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    yesterday.getFullYear() === date.getFullYear() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getDate() === date.getDate();
  if (isYesterday) return "Ayer";

  return DAY_FORMATTER.format(date);
}

export function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function fullName(firstName: string | null, lastName: string | null): string {
  const value = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return value.length > 0 ? value : "Usuario";
}

export function userInitials(firstName: string | null, lastName: string | null): string {
  const a = firstName?.charAt(0) ?? "";
  const b = lastName?.charAt(0) ?? "";
  return `${a}${b}`.toUpperCase() || "?";
}
