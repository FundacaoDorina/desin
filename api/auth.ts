import { isValidPassword, issueAccessToken } from "./_lib/auth.js";
import { type ApiRequest, type ApiResponse, getClientIp, sendServerError } from "./_lib/http.js";
import { getPasswordFromRequestBody } from "./_lib/parseBody.js";
import { clearFailures, getLockoutSeconds, registerFailure } from "./_lib/rateLimit.js";

const FAILURE_DELAY_MS = 800;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido." });
  }

  if (!process.env.ACCESS_PASSWORD?.trim()) {
    return res.status(403).json({ error: "O acesso por senha está desativado. Use a rede da Fundação." });
  }

  const ip = getClientIp(req);
  const lockout = getLockoutSeconds(ip);
  if (lockout > 0) {
    res.setHeader("Retry-After", String(lockout));
    return res.status(429).json({ error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." });
  }

  try {
    const password = getPasswordFromRequestBody(req.body);
    if (!isValidPassword(password)) {
      registerFailure(ip);
      await sleep(FAILURE_DELAY_MS);
      return res.status(401).json({ error: "Senha inválida." });
    }

    clearFailures(ip);
    return res.status(200).json({ token: issueAccessToken() });
  } catch (error) {
    return sendServerError(res, "login", error);
  }
}
