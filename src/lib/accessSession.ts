const ACCESS_TOKEN_KEY = "desin_access_token";
export const SESSION_EXPIRED_EVENT = "desin:session-expired";

function readStorage(): string | null {
  try {
    return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Lê o prazo de validade do token. Só serve para a interface; quem valida de verdade é o servidor. */
function getTokenExpiry(token: string): number | null {
  const [encodedPayload, signature, ...rest] = token.split(".");
  if (!encodedPayload || !signature || rest.length > 0) return null;
  try {
    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = readStorage();
  if (!token) return null;

  const exp = getTokenExpiry(token);
  if (!exp || exp <= Math.floor(Date.now() / 1000)) {
    clearAccessToken();
    return null;
  }
  return token;
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // Sem armazenamento disponível: a sessão dura só até recarregar a página.
  }
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore
  }
}

/** Encerra a sessão e avisa o App para voltar à tela de login. */
export function expireSession(): void {
  clearAccessToken();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}
