/**
 * Limite de tentativas de login por IP, em memória.
 *
 * Funções serverless podem rodar em várias instâncias e são recicladas, então isto é
 * uma barreira de "melhor esforço". A proteção definitiva é uma regra de rate limit
 * no Firewall da Vercel para POST /api/auth (ver README).
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const MAX_TRACKED_IPS = 5000;

const failures = new Map<string, { count: number; firstAt: number }>();

function prune(now: number) {
  for (const [ip, entry] of failures) {
    if (now - entry.firstAt > WINDOW_MS) failures.delete(ip);
  }
  // Evita crescimento ilimitado se muitos IPs diferentes tentarem.
  while (failures.size > MAX_TRACKED_IPS) {
    const oldest = failures.keys().next().value;
    if (oldest === undefined) break;
    failures.delete(oldest);
  }
}

/** Segundos até liberar novas tentativas, ou 0 se o IP não está bloqueado. */
export function getLockoutSeconds(ip: string, now = Date.now()): number {
  const entry = failures.get(ip);
  if (!entry) return 0;
  const elapsed = now - entry.firstAt;
  if (elapsed > WINDOW_MS) {
    failures.delete(ip);
    return 0;
  }
  return entry.count >= MAX_FAILURES ? Math.ceil((WINDOW_MS - elapsed) / 1000) : 0;
}

export function registerFailure(ip: string, now = Date.now()) {
  prune(now);
  const entry = failures.get(ip);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    failures.set(ip, { count: 1, firstAt: now });
  } else {
    entry.count += 1;
  }
}

export function clearFailures(ip: string) {
  failures.delete(ip);
}
