/**
 * The demo's interaction budget: 15 interactions per visitor per rolling
 * 15 minutes. The server enforces it per IP (the real gate); the client
 * mirrors the same numbers to draw the remaining budget on the quota ring.
 */
export const RATE_WINDOW_MS = 15 * 60_000;
export const RATE_MAX_INTERACTIONS = 15;

/**
 * Consume one interaction for `ip` from `log`, or refuse it: returns 0 when
 * within budget (and records the hit), otherwise the seconds until the
 * oldest hit rolls out of the window.
 */
export function retryAfterSeconds(
  log: Map<string, number[]>,
  ip: string,
  now: number = Date.now(),
): number {
  const recent = (log.get(ip) ?? []).filter((at) => now - at < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX_INTERACTIONS) {
    log.set(ip, recent);
    return Math.max(1, Math.ceil((recent[0] + RATE_WINDOW_MS - now) / 1000));
  }
  recent.push(now);
  log.set(ip, recent);
  if (log.size > 5_000) {
    for (const [key, hits] of log) {
      if (hits.every((at) => now - at >= RATE_WINDOW_MS)) log.delete(key);
    }
  }
  return 0;
}
