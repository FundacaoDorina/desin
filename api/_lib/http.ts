import { extractBearerToken, verifyAccessToken } from "./auth.js";
import { isAllowedNetwork } from "./network.js";

export interface ApiRequest {
  method?: string;
  url?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}

export interface ApiResponse {
  status: (statusCode: number) => ApiResponse;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string) => unknown;
}

export type AccessMode = "rede" | "senha";

function firstHeader(req: ApiRequest, name: string): string | undefined {
  const value = req.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * IP de quem fez a requisição. Na Vercel estes cabeçalhos são escritos pela própria Vercel
 * (o valor enviado pelo navegador é descartado), então não dá para falsificar o IP por eles.
 */
export function getClientIp(req: ApiRequest): string {
  const fromHeaders =
    firstHeader(req, "x-vercel-forwarded-for") || firstHeader(req, "x-real-ip") || firstHeader(req, "x-forwarded-for");
  return fromHeaders?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
}

/**
 * Resposta padrão de erro interno: registra o detalhe no log do servidor
 * e devolve ao navegador só uma mensagem genérica.
 */
export function sendServerError(res: ApiResponse, context: string, error: unknown) {
  console.error(`[api] ${context}:`, error);
  return res.status(500).json({ error: "Erro interno ao carregar os dados." });
}

/** "rede" se o IP é da fundação, "senha" se tem token válido, null se não tem acesso. */
export function getAccessMode(req: ApiRequest): AccessMode | null {
  if (isAllowedNetwork(getClientIp(req))) return "rede";
  // Sem ACCESS_PASSWORD o login por senha fica desligado (acesso só pela rede da fundação).
  if (!process.env.ACCESS_PASSWORD?.trim()) return null;
  const token = extractBearerToken(req);
  return token && verifyAccessToken(token) ? "senha" : null;
}

/**
 * Prepara a resposta de uma rota GET protegida.
 * Retorna false (e já respondeu) quando o método não é GET ou não há acesso.
 */
export function guardAuthenticatedGet(req: ApiRequest, res: ApiResponse): boolean {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Método não permitido." });
    return false;
  }

  let mode: AccessMode | null = null;
  try {
    mode = getAccessMode(req);
  } catch (error) {
    sendServerError(res, "verificação de acesso", error);
    return false;
  }

  if (!mode) {
    res.status(401).json({ error: "Acesso não autorizado." });
    return false;
  }
  return true;
}
