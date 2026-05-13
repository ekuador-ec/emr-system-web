/**
 * Encrypted draft cache for EM (Evoluciones Médicas) workspace.
 *
 * Per the AGENTS.md exception (see "Reglas de Seguridad y Buenas
 * Prácticas"), unsaved EM drafts can sit in localStorage as a last-
 * resort safety net for accidental refresh or offline gaps. The
 * payload is encrypted with AES-GCM using a key derived per session
 * from the current Supabase access_token via HKDF, so:
 *
 *   - Without an active session the blob is unreadable.
 *   - On logout the encryption key is unrecoverable, even if the
 *     ciphertext is still on disk (and clearAllDrafts() is called
 *     from the logout flow).
 *
 * The server remains the source of truth. The autosave hook uses
 * this cache only when the network or the server call fails, and
 * wipes the entry the moment the server-side autosave acknowledges
 * the change.
 */

import { supabase } from "@/infrastructure/core/supabaseClient";

const STORAGE_PREFIX = "emr:draft:";
const HKDF_INFO = "emr-draft-cache-v1";

export interface DraftCacheEntry<T> {
  payload: T;
  savedAt: string;
}

function buildKey(evolutionId: string): string {
  return `${STORAGE_PREFIX}${evolutionId}`;
}

function isBrowserCapable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined" &&
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.subtle !== "undefined"
  );
}

async function getAccessToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function deriveKeyFromSession(): Promise<CryptoKey | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const encoder = new TextEncoder();
  const ikm = encoder.encode(accessToken);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    ikm,
    { name: "HKDF" },
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(),
      info: encoder.encode(HKDF_INFO),
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function saveDraft<T>(evolutionId: string, payload: T): Promise<void> {
  if (!isBrowserCapable() || !evolutionId) return;

  try {
    const key = await deriveKeyFromSession();
    if (!key) return;

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data: DraftCacheEntry<T> = {
      payload,
      savedAt: new Date().toISOString(),
    };
    const plaintext = new TextEncoder().encode(JSON.stringify(data));
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext),
    );

    const blob = JSON.stringify({
      v: 1,
      iv: toBase64(iv),
      ct: toBase64(ciphertext),
    });

    window.localStorage.setItem(buildKey(evolutionId), blob);
  } catch {
    /* Cache is best-effort; silently ignore failures. */
  }
}

export async function loadDraft<T>(
  evolutionId: string,
): Promise<DraftCacheEntry<T> | null> {
  if (!isBrowserCapable() || !evolutionId) return null;

  try {
    const raw = window.localStorage.getItem(buildKey(evolutionId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { v: number; iv: string; ct: string };
    if (parsed.v !== 1) return null;

    const key = await deriveKeyFromSession();
    if (!key) return null;

    const iv = fromBase64(parsed.iv);
    const ciphertext = fromBase64(parsed.ct);

    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      ciphertext as BufferSource,
    );

    const text = new TextDecoder().decode(plaintext);
    return JSON.parse(text) as DraftCacheEntry<T>;
  } catch {
    return null;
  }
}

export function clearDraft(evolutionId: string): void {
  if (!isBrowserCapable() || !evolutionId) return;
  try {
    window.localStorage.removeItem(buildKey(evolutionId));
  } catch {
    /* Ignore quota / serialization errors. */
  }
}

export function clearAllDrafts(): void {
  if (!isBrowserCapable()) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    /* Ignore */
  }
}
