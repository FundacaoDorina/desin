import { type ApiRequest, type ApiResponse, getAccessMode, sendServerError } from "./_lib/http.js";

/** Diz ao navegador se ele já tem acesso: pela rede da fundação ou por um token válido. */
export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const access = getAccessMode(req);
    if (!access) return res.status(401).json({ access: null });
    return res.status(200).json({ access });
  } catch (error) {
    return sendServerError(res, "sessão", error);
  }
}
