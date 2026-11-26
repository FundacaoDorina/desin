import crypto from "node:crypto";

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 8;

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variável ${name} não configurada.`);
  }
  return value;
}

function hmac(value: string): string {
  return crypto.createHmac("sha256", requiredEnv("ACCESS_TOKEN_SECRET")).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  // Compara os HMACs (tamanho fixo) para não vazar o tamanho nem o conteúdo por tempo de resposta.
  return crypto.timingSafeEqual(
    Buffer.from(hmac(`cmp:${a}`)),
    Buffer.from(hmac(`cmp:${b}`))
  );
}

/**
 * Identificador da senha atual. Vai dentro do token: quando ACCESS_PASSWORD é trocada,
 * todos os tokens emitidos com a senha antiga deixam de valer.
 */
function passwordVersion(): string {
  return hmac(`pv:${requiredEnv("ACCESS_PASSWORD")}`).slice(0, 16);
}

export function isValidPassword(provided: string | undefined): boolean {
  if (!provided) return false;
  return safeEqual(provided.trim(), requiredEnv("ACCESS_PASSWORD"));
}

export function issueAccessToken(): string {
  const payload = JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS,
    pv: passwordVersion(),
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  return `${encodedPayload}.${hmac(encodedPayload)}`;
}

export function verifyAccessToken(token: string): boolean {
  const [encodedPayload, signature, ...rest] = token.split(".");
  if (!encodedPayload || !signature || rest.length > 0) return false;

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(hmac(encodedPayload));
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return false;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as {
      exp?: unknown;
      pv?: unknown;
    };
    if (typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) return false;
    return payload.pv === passwordVersion();
  } catch {
    return false;
  }
}

export function extractBearerToken(req: { headers?: Record<string, string | string[] | undefined> }): string | null {
  const authorization = req.headers?.authorization;
  const headerValue = Array.isArray(authorization) ? authorization[0] : authorization;
  if (!headerValue) return null;
  const match = headerValue.match(/^Bearer (\S+)$/i);
  return match?.[1] ?? null;
}
