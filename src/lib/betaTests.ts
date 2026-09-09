import type { BetaDifficulty, BetaFlag, BetaStatus, BetaTestItem } from "@/types/betaTest";

export const BETA_TESTS_PROJECT_ID = "plataforma-braille";
export const BETA_TESTS_SHEET_NAME = "testes_beta";

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

export function getDifficultyLabel(difficulty: BetaDifficulty): string {
  switch (difficulty) {
    case "facil":
      return "Fácil";
    case "medio":
      return "Médio";
    case "medio-dificil":
      return "Médio difícil";
    case "dificil":
      return "Difícil";
  }
}

export function getStatusLabel(status: BetaStatus): string {
  switch (status) {
    case "nao-iniciado":
      return "Não iniciado";
    case "em-correcao":
      return "Em correção";
    case "finalizado":
      return "Finalizado";
  }
}

export function getEmBetaLabel(flag: BetaFlag): string {
  return flag === "sim" ? "Sim" : "Não";
}

export function mapDifficultyValue(value: string): BetaDifficulty | null {
  const normalized = normalizeText(value).replace(/[_/\-]+/g, " ");
  if (!normalized) return null;

  if (
    normalized.includes("medio dificil") ||
    normalized.includes("amarelo escuro") ||
    normalized.includes("medium hard") ||
    normalized.includes("laranja")
  ) {
    return "medio-dificil";
  }
  if (
    normalized.includes("dificil") ||
    normalized.includes("vermelho") ||
    normalized.includes("hard") ||
    normalized.includes("red")
  ) {
    return "dificil";
  }
  if (
    normalized.includes("medio") ||
    normalized.includes("amarelo") ||
    normalized.includes("medium") ||
    normalized.includes("yellow")
  ) {
    return "medio";
  }
  if (
    normalized.includes("facil") ||
    normalized.includes("verde") ||
    normalized.includes("easy") ||
    normalized.includes("green")
  ) {
    return "facil";
  }
  return null;
}

export function mapStatusValue(value: string): BetaStatus {
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

export function mapEmBetaValue(value: string): BetaFlag {
  const normalized = normalizeText(value);
  if (["sim", "yes", "true", "1"].includes(normalized)) return "sim";
  return "nao";
}

export function getDifficultyClass(difficulty: BetaDifficulty | null, isFinished: boolean): string {
  if (isFinished) {
    return "bg-beta-finished text-beta-finished-foreground";
  }
  if (!difficulty) {
    return "text-card-foreground";
  }
  switch (difficulty) {
    case "facil":
      return "bg-beta-easy text-beta-easy-foreground";
    case "medio":
      return "bg-beta-medium text-beta-medium-foreground";
    case "medio-dificil":
      return "bg-beta-medium-hard text-beta-medium-hard-foreground";
    case "dificil":
      return "bg-beta-hard text-beta-hard-foreground";
  }
}

export function getStatusClass(status: BetaStatus): string {
  switch (status) {
    case "em-correcao":
      return "bg-primary text-primary-foreground";
    case "finalizado":
      return "bg-background text-foreground";
    case "nao-iniciado":
    default:
      return "bg-sidebar-light text-card-foreground";
  }
}

export function getEmBetaClass(flag: BetaFlag): string {
  return flag === "sim"
    ? "bg-beta-flag-yes text-beta-flag-yes-foreground"
    : "bg-beta-flag-no text-beta-flag-no-foreground";
}

export function rowsToBetaTests(rows: string[][]): BetaTestItem[] {
  const header = rows[0] ?? [];
  const dataRows = rows.slice(1);
  const headerMap = new Map(header.map((column, index) => [normalizeHeader(column), index]));

  const getCell = (cells: string[], aliases: string[], fallbackIndex?: number) => {
    for (const alias of aliases) {
      const index = headerMap.get(alias);
      if (index !== undefined) return (cells[index] ?? "").trim();
    }
    if (fallbackIndex === undefined) return "";
    return (cells[fallbackIndex] ?? "").trim();
  };

  return dataRows
    .map((cells, rowIndex) => {
      const correcao = getCell(cells, ["correcao", "correction", "item"], 0);
      if (!correcao || normalizeHeader(correcao) === "correcao") return null;

      const projectId =
        getCell(cells, ["project_id", "projeto", "project"]) || BETA_TESTS_PROJECT_ID;
      const id = getCell(cells, ["id"]) || `${projectId}-beta-${rowIndex + 1}`;
      const prioridadeRaw = getCell(cells, ["prioridade", "prioridade_1_5", "priority"], 2);
      const prioridade = Number.parseInt(prioridadeRaw || "1", 10);

      return {
        id,
        projectId,
        correcao,
        dificuldade: mapDifficultyValue(getCell(cells, ["dificuldade", "difficulty", "cor"])),
        status: mapStatusValue(getCell(cells, ["status"], 1)),
        prioridade: Number.isNaN(prioridade) ? 1 : Math.min(5, Math.max(1, prioridade)),
        emBeta: mapEmBetaValue(getCell(cells, ["em_beta", "embeta", "beta"], 3)),
      } satisfies BetaTestItem;
    })
    .filter((item): item is BetaTestItem => item !== null);
}
