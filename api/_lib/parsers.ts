/**
 * Conversão das linhas da planilha para os formatos usados pelo frontend.
 * Roda só no servidor: o navegador nunca acessa a planilha diretamente.
 */
import type { Project, TimelineItemColor, TimelineYear } from "../../src/types/project.js";
import type { ScriptItem } from "../../src/types/script.js";
import type { BetaDifficulty, BetaFlag, BetaStatus, BetaTestItem } from "../../src/types/betaTest.js";

export const BETA_TESTS_PROJECT_ID = "plataforma-braille";
export const BETA_TESTS_SHEET_NAME = "testes_beta";
export const LINEAR_CORRECTIONS_PROJECT_ID = "linear";
export const LINEAR_CORRECTIONS_SHEET_NAME = "correcoes_linear";
const DOC_TITLE_PREFIX = "[[DOC_TITLE]]";

function normalizeText(value: string): string {
  return `${value ?? ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function normalizeHeader(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

/**
 * Separa cabeçalho e dados. A primeira linha só é tratada como cabeçalho se tiver a coluna-chave
 * (ex.: "project_id"); senão a aba é lida sem cabeçalho, pela posição das colunas.
 * A aba roadmap, escrita pela automação do agenda-desin, não tem cabeçalho.
 */
function readTable(rows: string[][], keyColumn: string) {
  const first = (rows[0] ?? []).map((column) => column.trim().toLowerCase());
  const hasHeader = first.includes(keyColumn);
  const headerMap = new Map(hasHeader ? first.map((column, index) => [column, index]) : []);
  return {
    dataRows: hasHeader ? rows.slice(1) : rows,
    getCell: (cells: string[], headerName: string, fallbackIndex: number) => {
      const index = headerMap.get(headerName);
      return (cells[index ?? fallbackIndex] ?? "").trim();
    },
  };
}

/** Aceita só links http(s); qualquer outro esquema (javascript:, data:...) é descartado. */
export function toSafeHttpUrl(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function mapColorValue(value: string): TimelineItemColor {
  switch (normalizeText(value)) {
    case "concluido":
    case "done":
      return "success";
    case "em andamento":
    case "in progress":
      return "warning";
    case "suspenso":
    case "suspensa":
    case "suspended":
      return "suspended";
    case "encerrado":
    case "encerrada":
    case "closed":
      return "closed";
    default:
      return "muted";
  }
}

export function rowsToProjects(rows: string[][]): Project[] {
  const { dataRows, getCell } = readTable(rows, "project_id");
  const projectsMap = new Map<
    string,
    {
      name: string;
      status: string;
      nextStep: string;
      documentationContent?: string;
      kind: "default" | "scripts";
      yearsMap: Map<string, Array<{ text: string; color: TimelineItemColor }>>;
    }
  >();

  for (const cells of dataRows) {
    const projectId = getCell(cells, "project_id", 0);
    if (!projectId) continue;

    const projectName = getCell(cells, "project_name", 1);
    const status = getCell(cells, "status", 2);
    const nextStep = getCell(cells, "next_step", 3);
    const year = getCell(cells, "year", 4);
    const itemText = getCell(cells, "item", 5);
    const itemColor = getCell(cells, "item_status", 6);
    const documentationContent =
      getCell(cells, "documentation_content", 7) || getCell(cells, "documentation_url", 7);
    const kind: "default" | "scripts" = getCell(cells, "kind", 8).toLowerCase() === "scripts" ? "scripts" : "default";

    if (!projectsMap.has(projectId)) {
      projectsMap.set(projectId, {
        name: projectName,
        status,
        nextStep,
        documentationContent,
        kind,
        yearsMap: new Map(),
      });
    }

    const project = projectsMap.get(projectId)!;
    if (projectName) project.name = projectName;
    if (status) project.status = status;
    if (nextStep) project.nextStep = nextStep;
    if (documentationContent) project.documentationContent = documentationContent;
    project.kind = kind;

    if (itemText) {
      if (!project.yearsMap.has(year)) project.yearsMap.set(year, []);
      project.yearsMap.get(year)!.push({ text: itemText, color: mapColorValue(itemColor) });
    }
  }

  return Array.from(projectsMap.entries()).map(([id, data]) => {
    const timeline: TimelineYear[] = Array.from(data.yearsMap.entries())
      .map(([year, items]) => ({ year, items }))
      .sort((a, b) => Number.parseInt(a.year, 10) - Number.parseInt(b.year, 10));

    return {
      id,
      name: data.name,
      status: data.status,
      nextStep: data.nextStep,
      documentationContent: data.documentationContent,
      kind: data.kind,
      timeline,
    };
  });
}

export function rowsToScripts(rows: string[][]): ScriptItem[] {
  const { dataRows, getCell } = readTable(rows, "id");
  return dataRows.flatMap((cells) => {
    const id = getCell(cells, "id", 0);
    const name = getCell(cells, "name", 1);
    if (!id || !name) return [];
    return [
      {
        id,
        name,
        summary: getCell(cells, "summary", 2),
        howItWorks: getCell(cells, "how_it_works", 3),
        usage: getCell(cells, "usage", 4),
        link: toSafeHttpUrl(getCell(cells, "link", 5)),
      },
    ];
  });
}

export function rowsToProjectDocsMap(rows: string[][]): Record<string, string> {
  const { dataRows, getCell } = readTable(rows, "project_id");
  const parsedRows = dataRows
    .map((cells) => {
      const projectId = getCell(cells, "project_id", 0);
      const content = getCell(cells, "content", 3);
      if (!projectId || !content) return null;
      return {
        projectId,
        order: Number.parseInt(getCell(cells, "order", 1) || "9999", 10),
        title: getCell(cells, "title", 2) || undefined,
        content,
      };
    })
    .filter((row): row is { projectId: string; order: number; title: string | undefined; content: string } => !!row)
    .sort((a, b) => a.order - b.order);

  const docsByProject: Record<string, string> = {};
  for (const row of parsedRows) {
    const block = row.title ? `${DOC_TITLE_PREFIX}${row.title}\n${row.content}` : row.content;
    docsByProject[row.projectId] = docsByProject[row.projectId]
      ? `${docsByProject[row.projectId]}\n\n${block}`
      : block;
  }
  return docsByProject;
}

function mapDifficultyValue(value: string): BetaDifficulty | null {
  const normalized = normalizeText(value).replace(/[_/-]+/g, " ");
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
  return ["sim", "yes", "true", "1"].includes(normalizeText(value)) ? "sim" : "nao";
}

export function rowsToBetaTests(rows: string[][], defaultProjectId: string): BetaTestItem[] {
  const header = rows[0] ?? [];
  const headerMap = new Map(header.map((column, index) => [normalizeHeader(column), index]));

  const getCell = (cells: string[], aliases: string[], fallbackIndex?: number) => {
    for (const alias of aliases) {
      const index = headerMap.get(alias);
      if (index !== undefined) return (cells[index] ?? "").trim();
    }
    if (fallbackIndex === undefined) return "";
    return (cells[fallbackIndex] ?? "").trim();
  };

  return rows
    .slice(1)
    .map((cells, rowIndex): BetaTestItem | null => {
      const correcao = getCell(cells, ["correcao", "correction", "item"], 0);
      if (!correcao || normalizeHeader(correcao) === "correcao") return null;

      const projectId = getCell(cells, ["project_id", "projeto", "project"]) || defaultProjectId;
      const prioridade = Number.parseInt(getCell(cells, ["prioridade", "prioridade_1_5", "priority"], 2) || "1", 10);

      return {
        id: getCell(cells, ["id"]) || `${projectId}-beta-${rowIndex + 1}`,
        projectId,
        correcao,
        dificuldade: mapDifficultyValue(getCell(cells, ["dificuldade", "difficulty", "cor"])),
        status: mapStatusValue(getCell(cells, ["status"], 1)),
        prioridade: Number.isNaN(prioridade) ? 1 : Math.min(5, Math.max(1, prioridade)),
        emBeta: mapEmBetaValue(getCell(cells, ["em_beta", "embeta", "beta"], 3)),
      };
    })
    .filter((item): item is BetaTestItem => item !== null);
}
