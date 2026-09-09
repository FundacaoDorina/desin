import { extractBearerToken, verifyAccessToken } from "./_lib/auth";
import { createHeaderMap, getCellByHeader, getSheetRows } from "./_lib/sheets";

type BetaDifficulty = "facil" | "medio" | "medio-dificil" | "dificil";
type BetaStatus = "nao-iniciado" | "em-correcao" | "finalizado";
type BetaFlag = "sim" | "nao";

interface ApiRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (statusCode: number) => ApiResponse;
  json: (payload: unknown) => void;
}

function unauthorized(res: ApiResponse) {
  return res.status(401).json({ error: "Acesso não autorizado." });
}

function normalizeText(value: string): string {
  return value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizeHeader(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function mapDifficultyValue(value: string): BetaDifficulty | null {
  const normalized = normalizeText(value).replace(/[_-]+/g, " ");
  switch (normalized) {
    case "facil":
    case "easy":
    case "verde":
    case "green":
      return "facil";
    case "medio":
    case "medium":
    case "amarelo":
    case "amarelo claro":
    case "yellow":
    case "light yellow":
      return "medio";
    case "medio dificil":
    case "medium hard":
    case "amarelo escuro":
    case "dark yellow":
    case "laranja":
      return "medio-dificil";
    case "dificil":
    case "hard":
    case "vermelho":
    case "red":
      return "dificil";
    default:
      return null;
  }
}

function mapStatusValue(value: string): BetaStatus {
  const normalized = normalizeText(value);
  if (
    normalized.includes("finaliz") ||
    normalized.includes("conclu") ||
    normalized === "done" ||
    normalized === "finished"
  ) {
    return "finalizado";
  }
  if (
    normalized.includes("correc") ||
    normalized.includes("execuc") ||
    normalized.includes("andamento") ||
    normalized === "in progress"
  ) {
    return "em-correcao";
  }
  return "nao-iniciado";
}

function mapEmBetaValue(value: string): BetaFlag {
  const normalized = normalizeText(value);
  if (["sim", "yes", "true", "1"].includes(normalized)) return "sim";
  return "nao";
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const token = extractBearerToken(req);
  if (!token || !verifyAccessToken(token)) {
    return unauthorized(res);
  }

  try {
    const rows = await getSheetRows("testes_beta");
    if (rows.length < 2) return res.status(200).json([]);

    const headerMap = createHeaderMap(rows[0].map(normalizeHeader));
    const items = rows.slice(1).flatMap((cells, rowIndex) => {
      const named = (aliases: string[], fallback?: number) => {
        for (const alias of aliases) {
          const value = getCellByHeader(cells, headerMap, alias, fallback ?? -1).trim();
          if (headerMap.has(alias)) return value;
        }
        if (fallback === undefined || fallback < 0) return "";
        return (cells[fallback] ?? "").trim();
      };

      const correcao = named(["correcao", "correction", "item"], 0);
      if (!correcao) return [];

      const projectId = named(["project_id", "projeto", "project"]) || "plataforma-braille";
      const prioridadeRaw = named(["prioridade", "prioridade_1_5", "priority"], 2);
      const prioridade = Number.parseInt(prioridadeRaw || "1", 10);

      return [
        {
          id: named(["id"]) || `${projectId}-beta-${rowIndex + 1}`,
          projectId,
          correcao,
          dificuldade: mapDifficultyValue(named(["dificuldade", "difficulty", "cor"])),
          status: mapStatusValue(named(["status"], 1)),
          prioridade: Number.isNaN(prioridade) ? 1 : Math.min(5, Math.max(1, prioridade)),
          emBeta: mapEmBetaValue(named(["em_beta", "embeta", "beta"], 3)),
        },
      ];
    });

    return res.status(200).json(items);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao buscar testes em beta.";
    return res.status(500).json({ error: message });
  }
}
