import crypto from "node:crypto";

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 8;

function getAccessSecret(): string {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("Variável ACCESS_TOKEN_SECRET não configurada.");
  }
  return secret;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string): string {
  return crypto.createHmac("sha256", getAccessSecret()).update(payload).digest("base64url");
}

export function issueAccessToken(): string {
  const payload = JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS,
  });
  const encodedPayload = base64UrlEncode(payload);
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAccessToken(token: string): boolean {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const expectedSignature = signPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as { exp?: number };
    if (!payload.exp) return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function extractBearerToken(req: { headers?: Record<string, string | string[] | undefined> }): string | null {
  const authorization = req.headers?.authorization;
  const headerValue = Array.isArray(authorization) ? authorization[0] : authorization;
  if (!headerValue) return null;
  const match = headerValue.match(/^Bearer (.+)$/i);
  return match?.[1] ?? null;
}
