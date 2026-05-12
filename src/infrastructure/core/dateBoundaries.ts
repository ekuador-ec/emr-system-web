/**
 * Helpers to convert a YYYY-MM-DD date string (as captured by an
 * <input type="date" /> in the user's local timezone) into ISO 8601
 * timestamps that anchor that day in the user's local timezone.
 *
 * The Supabase columns we filter on (created_at, updated_at, ...) are
 * timestamptz, so PostgreSQL needs an unambiguous instant. Sending
 * literal "T00:00:00Z" used to anchor the day boundary in UTC, which
 * silently dropped rows for users outside UTC: a record edited at
 * 20:00 UTC-5 (Ecuador) has updated_at on the next UTC day and fell
 * out of the "today" window.
 *
 * Using the Date constructor with local components and toISOString()
 * yields the equivalent UTC instant for the local boundary, so the
 * resulting filter covers the FULL local day no matter where the
 * client is. The browser's TZ database determines the offset; no
 * country-specific hardcoding required.
 */

function parseLocalYmd(dateStr: string): [number, number, number] {
  const [year, month, day] = dateStr.split("-").map(Number);
  return [year, month, day];
}

export function startOfLocalDayIso(dateStr: string): string {
  const [year, month, day] = parseLocalYmd(dateStr);
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
}

export function endOfLocalDayIso(dateStr: string): string {
  const [year, month, day] = parseLocalYmd(dateStr);
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
}
