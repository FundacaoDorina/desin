import { issueAccessToken } from "./_lib/auth";

interface ApiRequest {
  method?: string;
  body?: { password?: string };
}

interface ApiResponse {
  status: (statusCode: number) => ApiResponse;
  json: (payload: unknown) => void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const configuredPassword = process.env.ACCESS_PASSWORD;
  if (!configuredPassword) {
    return res.status(500).json({ error: "A senha de acesso não foi configurada." });
  }

  const providedPassword = req.body?.password;
  if (!providedPassword || providedPassword !== configuredPassword) {
    return res.status(401).json({ error: "Senha inválida." });
  }

  const token = issueAccessToken();
  return res.status(200).json({ token });
}
