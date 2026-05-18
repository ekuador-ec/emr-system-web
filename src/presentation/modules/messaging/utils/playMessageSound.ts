/**
 * playMessageSound — short two-note ping generated with the Web Audio API.
 *
 * No external assets are required and there is no licensing concern.
 * The function caches a single `AudioContext` across calls and enforces
 * a 2-second cooldown so a burst of incoming messages does not spam the
 * speakers.
 *
 * Browsers gate `AudioContext` until the user interacts with the page;
 * since the user has logged in by the time messages arrive, the context
 * is allowed to play. If the context is suspended (eg. backgrounded
 * tab), we attempt `resume()` best-effort and silently no-op on failure.
 */

const MIN_INTERVAL_MS = 2_000;

interface WindowWithWebkit extends Window {
  webkitAudioContext?: typeof AudioContext;
}

let cachedContext: AudioContext | null = null;
let lastPlayedAt = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext || (window as WindowWithWebkit).webkitAudioContext;
  if (!Ctor) return null;
  if (!cachedContext) {
    try {
      cachedContext = new Ctor();
    } catch {
      return null;
    }
  }
  return cachedContext;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startAt: number,
  durationSec: number,
  volume: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(volume, startAt + 0.008);
  gain.gain.linearRampToValueAtTime(0, startAt + durationSec);
  osc.start(startAt);
  osc.stop(startAt + durationSec + 0.02);
}

export function playMessageSound(): void {
  const now = Date.now();
  if (now - lastPlayedAt < MIN_INTERVAL_MS) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const start = ctx.currentTime + 0.01;
  playTone(ctx, 880, start, 0.09, 0.16);
  playTone(ctx, 1174.66, start + 0.085, 0.12, 0.16);

  lastPlayedAt = now;
}
