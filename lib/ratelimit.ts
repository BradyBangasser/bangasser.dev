// Best-effort in-memory token bucket. NOTE: serverless instances don't share
// memory, so for hard global limits back this with a KV store (Upstash, etc.).
// Good enough to blunt casual abuse; the owner is exempt.
type Bucket = { tokens: number; updated: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, perDay: number): { ok: boolean; remaining: number } {
  const now = Date.now();
  const refill = perDay / 864e5; // tokens per ms
  const b = buckets.get(key) ?? { tokens: perDay, updated: now };
  b.tokens = Math.min(perDay, b.tokens + (now - b.updated) * refill);
  b.updated = now;
  if (b.tokens < 1) {
    buckets.set(key, b);
    return { ok: false, remaining: 0 };
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return { ok: true, remaining: Math.floor(b.tokens) };
}
