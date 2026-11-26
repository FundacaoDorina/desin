/**
 * Lê abas da planilha privada pelo App da Web do Apps Script (apps-script/plataforma.gs).
 * A URL e a chave ficam só nas variáveis do servidor; o navegador nunca as vê.
 */
const REQUEST_TIMEOUT_MS = 20_000;
const CACHE_TTL_MS = 30_000;

const cache = new Map<string, { at: number; rows: Promise<string[][]> }>();

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variável ${name} não configurada.`);
  }
  return value;
}

async function fetchSheetRows(sheetName: string): Promise<string[][]> {
  const url = requiredEnv("APPS_SCRIPT_URL");
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)) {
    throw new Error("APPS_SCRIPT_URL deve ser a URL do App da Web (https://script.google.com/macros/s/…/exec).");
  }

  // O Apps Script responde ao POST com um redirecionamento para o resultado; o fetch segue sozinho.
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chave: requiredEnv("APPS_SCRIPT_KEY"), aba: sheetName }),
    redirect: "follow",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Apps Script respondeu ${response.status} para a aba ${sheetName}.`);
  }

  let data: { linhas?: unknown; erro?: unknown };
  try {
    data = (await response.json()) as typeof data;
  } catch {
    throw new Error("Apps Script não devolveu JSON. Confira se a implantação permite acesso a 'Qualquer pessoa'.");
  }
  if (data.erro) {
    throw new Error(`Apps Script recusou a aba ${sheetName}: ${String(data.erro)}.`);
  }
  if (!Array.isArray(data.linhas) || !data.linhas.every(Array.isArray)) {
    throw new Error(`Resposta inesperada do Apps Script para a aba ${sheetName}.`);
  }
  return (data.linhas as unknown[][]).map((cells) => cells.map((cell) => `${cell ?? ""}`));
}

/** Linhas de uma aba, como texto. Guarda o resultado por 30 s em cada instância. */
export async function getSheetRows(sheetName: string): Promise<string[][]> {
  const now = Date.now();
  const cached = cache.get(sheetName);
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.rows;

  const rows = fetchSheetRows(sheetName);
  cache.set(sheetName, { at: now, rows });
  rows.catch(() => cache.delete(sheetName));
  return rows;
}
