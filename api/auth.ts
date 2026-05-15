import { issueAccessToken } from "./_lib/auth";
import { getPasswordFromRequestBody } from "./_lib/parseBody";

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Método não permitido." }, { status: 405 });
  }

  try {
    const configuredPassword = process.env.ACCESS_PASSWORD?.trim();
    if (!configuredPassword) {
      return Response.json(
        { error: "ACCESS_PASSWORD não configurado na Vercel (Production e Preview)." },
        { status: 500 }
      );
    }

    const tokenSecret = process.env.ACCESS_TOKEN_SECRET?.trim();
    if (!tokenSecret) {
      return Response.json(
        { error: "ACCESS_TOKEN_SECRET não configurado na Vercel (Production e Preview)." },
        { status: 500 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Corpo da requisição inválido." }, { status: 400 });
    }

    const providedPassword = getPasswordFromRequestBody(body)?.trim();
    if (!providedPassword || providedPassword !== configuredPassword) {
      return Response.json({ error: "Senha inválida." }, { status: 401 });
    }

    const token = issueAccessToken();
    return Response.json({ token }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao processar login.";
    return Response.json({ error: message }, { status: 500 });
  }
}
