export const config = { runtime: "edge" };

const TOKEN_TTL_SECONDS = 60 * 60 * 8;

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signPayload(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const bytes = new Uint8Array(signature);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function issueAccessToken(secret: string): Promise<string> {
  const encodedPayload = toBase64Url(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS })
  );
  const signature = await signPayload(secret, encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function getPasswordFromBody(body: unknown): string | undefined {
  if (body == null || typeof body !== "object" || !("password" in body)) return undefined;
  const password = (body as { password?: unknown }).password;
  return typeof password === "string" ? password : undefined;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Método não permitido." }, { status: 405 });
  }

  try {
    const configuredPassword = process.env.ACCESS_PASSWORD?.trim();
    if (!configuredPassword) {
      return Response.json(
        { error: "ACCESS_PASSWORD não configurado na Vercel." },
        { status: 500 }
      );
    }

    const tokenSecret = process.env.ACCESS_TOKEN_SECRET?.trim();
    if (!tokenSecret) {
      return Response.json(
        { error: "ACCESS_TOKEN_SECRET não configurado na Vercel." },
        { status: 500 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Corpo da requisição inválido." }, { status: 400 });
    }

    const providedPassword = getPasswordFromBody(body)?.trim();
    if (!providedPassword || providedPassword !== configuredPassword) {
      return Response.json({ error: "Senha inválida." }, { status: 401 });
    }

    const token = await issueAccessToken(tokenSecret);
    return Response.json({ token }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao processar login.";
    return Response.json({ error: message }, { status: 500 });
  }
}
