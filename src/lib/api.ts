import { expireSession, getAccessToken } from "@/lib/accessSession";

export type AccessMode = "rede" | "senha";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Pergunta ao servidor se este navegador já tem acesso:
 * "rede" (está na rede da Fundação), "senha" (token válido) ou null.
 */
export async function checkAccess(): Promise<AccessMode | null> {
  try {
    const response = await fetch("/api/session", { headers: authHeaders(), cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as { access?: unknown };
    return data.access === "rede" || data.access === "senha" ? data.access : null;
  } catch {
    return null;
  }
}

/** GET em uma rota de /api. Sem acesso, devolve o usuário à tela de login. */
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`/api/${path}`, { headers: authHeaders(), cache: "no-store" });

  if (response.status === 401) {
    expireSession();
    throw new ApiError("Sessão expirada.", 401);
  }
  if (!response.ok) {
    throw new ApiError("Não foi possível carregar os dados.", response.status);
  }
  return (await response.json()) as T;
}

/** Não repete requisições que falharam por falta de autorização. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status === 401) return false;
  return failureCount < 2;
}
