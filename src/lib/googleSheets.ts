import type { Project, TimelineYear, TimelineItemColor } from "@/types/project";
import type { ScriptItem } from "@/types/script";

/**
 * Mapeia os valores amigáveis da planilha para os códigos de cor do sistema.
 */
function mapColorValue(value: string): TimelineItemColor {
  const normalized = value?.toString().toLowerCase().trim();
  switch (normalized) {
    case "concluído":
    case "concluido":
    case "done":
      return "success";
    case "em andamento":
    case "in progress":
      return "warning";
    case "planejado":
    case "planned":
    default:
      return "muted";
  }
}

/**
 * Parser simples de CSV que lida com campos entre aspas e quebras de linha.
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++; // pula a próxima aspas
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(current.trim());
        current = "";
      } else if (char === "\r" && next === "\n") {
        row.push(current.trim());
        current = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
        i++; // pula \n
      } else if (char === "\n") {
        row.push(current.trim());
        current = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else {
        current += char;
      }
    }
  }

  // última célula/row
  row.push(current.trim());
  if (row.length > 1 || row[0] !== "") rows.push(row);

  return rows;
}

/**
 * Transforma linhas do CSV em Project[].
 *
 * Colunas esperadas:
 *   0: project_id
 *   1: project_name
 *   2: status
 *   3: next_step
 *   4: year
 *   5: item
 *   6: item_status ("Concluído", "Em andamento", "Planejado")
 */
function rowsToProjects(rows: string[][]): Project[] {
  const header = rows[0] ?? [];
  const dataRows = rows.slice(1);
  const headerMap = new Map(header.map((column, index) => [column.trim().toLowerCase(), index]));

  const getCellByHeader = (cells: string[], headerName: string, fallbackIndex: number) => {
    const index = headerMap.get(headerName);
    if (index === undefined) return cells[fallbackIndex] ?? "";
    return cells[index] ?? "";
  };

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
    if (cells.length < 7) continue;

    const projectId = getCellByHeader(cells, "project_id", 0)?.trim();
    const projectName = getCellByHeader(cells, "project_name", 1)?.trim();
    const status = getCellByHeader(cells, "status", 2)?.trim();
    const nextStep = getCellByHeader(cells, "next_step", 3)?.trim();
    const year = getCellByHeader(cells, "year", 4)?.trim();
    const itemText = getCellByHeader(cells, "item", 5)?.trim();
    const itemColor = getCellByHeader(cells, "item_status", 6)?.trim();
    const documentationContent =
      getCellByHeader(cells, "documentation_content", 7)?.trim() ||
      getCellByHeader(cells, "documentation_url", 7)?.trim();
    const kindValue = getCellByHeader(cells, "kind", 8)?.trim().toLowerCase();
    const kind: "default" | "scripts" = kindValue === "scripts" ? "scripts" : "default";

    if (!projectId) continue;

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
    if (kind) project.kind = kind;

    if (itemText) {
      if (!project.yearsMap.has(year)) {
        project.yearsMap.set(year, []);
      }

      project.yearsMap.get(year)!.push({
        text: itemText,
        color: mapColorValue(itemColor),
      });
    }
  }

  const projects: Project[] = [];
  for (const [id, projectData] of projectsMap) {
    const timeline: TimelineYear[] = [];
    for (const [year, items] of projectData.yearsMap) {
      timeline.push({ year, items });
    }
    timeline.sort((a, b) => parseInt(a.year) - parseInt(b.year));

    projects.push({
      id,
      name: projectData.name,
      status: projectData.status,
      nextStep: projectData.nextStep,
      documentationContent: projectData.documentationContent,
      kind: projectData.kind,
      timeline,
    });
  }

  return projects;
}

/**
 * Busca os dados dos projetos a partir de uma planilha do Google Sheets publicada.
 *
 * Aceita dois formatos de ID:
 *   - ID de publicação (começa com "2PACX-"): usa o endpoint /pub?output=csv
 *   - ID original da planilha: usa o endpoint /gviz/tq
 */
export async function fetchProjectsFromSheets(
  sheetId: string
): Promise<Project[]> {
  const isPublishedId = sheetId.startsWith("2PACX-");

  let csvText: string;

  if (isPublishedId) {
    // Endpoint de planilha publicada (Arquivo > Compartilhar > Publicar na Web)
    const url = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv&gid=0`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao buscar planilha publicada: ${response.status}`);
    }
    csvText = await response.text();
  } else {
    // Endpoint gviz para planilhas compartilhadas publicamente
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=roadmap`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Falha ao buscar planilha: ${response.status}. Verifique se a planilha está compartilhada como "Qualquer pessoa com o link".`
      );
    }
    csvText = await response.text();
  }

  // Verifica se recebeu HTML (página de login do Google) ao invés de CSV
  if (csvText.trim().startsWith("<!DOCTYPE") || csvText.trim().startsWith("<html")) {
    throw new Error(
      "A planilha não está acessível publicamente. Publique-a em: Arquivo > Compartilhar > Publicar na Web."
    );
  }

  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    throw new Error("A planilha está vazia ou não tem dados suficientes.");
  }

  return rowsToProjects(rows);
}

function rowsToScripts(rows: string[][]): ScriptItem[] {
  const header = rows[0] ?? [];
  const dataRows = rows.slice(1);
  const headerMap = new Map(header.map((column, index) => [column.trim().toLowerCase(), index]));

  const getCell = (cells: string[], headerName: string, fallbackIndex: number) => {
    const index = headerMap.get(headerName);
    if (index === undefined) return cells[fallbackIndex] ?? "";
    return cells[index] ?? "";
  };

  return dataRows
    .map((cells) => {
      const id = getCell(cells, "id", 0).trim();
      const name = getCell(cells, "name", 1).trim();
      const summary = getCell(cells, "summary", 2).trim();
      const howItWorks = getCell(cells, "how_it_works", 3).trim();
      const usage = getCell(cells, "usage", 4).trim();
      const link = getCell(cells, "link", 5).trim();

      if (!id || !name) return null;

      return {
        id,
        name,
        summary,
        howItWorks,
        usage,
        link: link || undefined,
      } satisfies ScriptItem;
    })
    .filter((item): item is ScriptItem => item !== null);
}

export async function fetchScriptsFromSheets(
  sheetId: string,
  publishedScriptsGid?: string
): Promise<ScriptItem[]> {
  const isPublishedId = sheetId.startsWith("2PACX-");
  let csvText: string;

  if (isPublishedId) {
    const gid = publishedScriptsGid?.trim();
    if (!gid) {
      throw new Error(
        "Para planilha publicada, configure VITE_GOOGLE_SHEETS_SCRIPTS_GID com o gid da aba scripts."
      );
    }
    const url = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv&gid=${encodeURIComponent(gid)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao buscar scripts da planilha publicada: ${response.status}`);
    }
    csvText = await response.text();
  } else {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=scripts`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Falha ao buscar scripts da planilha: ${response.status}. Verifique permissões de compartilhamento.`
      );
    }
    csvText = await response.text();
  }

  if (csvText.trim().startsWith("<!DOCTYPE") || csvText.trim().startsWith("<html")) {
    throw new Error(
      "A aba de scripts não está acessível publicamente. Publique a planilha para leitura."
    );
  }

  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  return rowsToScripts(rows);
}

interface ProjectDocRow {
  projectId: string;
  order: number;
  title?: string;
  content: string;
}

const DOC_TITLE_PREFIX = "[[DOC_TITLE]]";

function rowsToProjectDocsMap(rows: string[][]): Record<string, string> {
  const header = rows[0] ?? [];
  const dataRows = rows.slice(1);
  const headerMap = new Map(header.map((column, index) => [column.trim().toLowerCase(), index]));

  const getCell = (cells: string[], headerName: string, fallbackIndex: number) => {
    const index = headerMap.get(headerName);
    if (index === undefined) return cells[fallbackIndex] ?? "";
    return cells[index] ?? "";
  };

  const parsedRows: ProjectDocRow[] = dataRows
    .map((cells) => {
      const projectId = getCell(cells, "project_id", 0).trim();
      const orderRaw = getCell(cells, "order", 1).trim();
      const title = getCell(cells, "title", 2).trim();
      const content = getCell(cells, "content", 3).trim();
      if (!projectId || !content) return null;
      return {
        projectId,
        order: Number.parseInt(orderRaw || "9999", 10),
        title: title || undefined,
        content,
      } satisfies ProjectDocRow;
    })
    .filter((row): row is ProjectDocRow => row !== null)
    .sort((a, b) => a.order - b.order);

  const docsByProject: Record<string, string> = {};
  for (const row of parsedRows) {
    const block = row.title
      ? `${DOC_TITLE_PREFIX}${row.title}\n${row.content}`
      : row.content;
    docsByProject[row.projectId] = docsByProject[row.projectId]
      ? `${docsByProject[row.projectId]}\n\n${block}`
      : block;
  }

  return docsByProject;
}

export async function fetchProjectDocsFromSheets(
  sheetId: string,
  publishedDocsGid?: string
): Promise<Record<string, string>> {
  const isPublishedId = sheetId.startsWith("2PACX-");
  let csvText: string;

  if (isPublishedId) {
    const gid = publishedDocsGid?.trim();
    if (!gid) {
      throw new Error(
        "Para planilha publicada, configure VITE_GOOGLE_SHEETS_DOCS_GID com o gid da aba project_docs."
      );
    }
    const url = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv&gid=${encodeURIComponent(gid)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao buscar documentação da planilha publicada: ${response.status}`);
    }
    csvText = await response.text();
  } else {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=project_docs`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Falha ao buscar documentação da planilha: ${response.status}. Verifique permissões de compartilhamento.`
      );
    }
    csvText = await response.text();
  }

  if (csvText.trim().startsWith("<!DOCTYPE") || csvText.trim().startsWith("<html")) {
    throw new Error("A aba de documentação não está acessível publicamente.");
  }

  const rows = parseCSV(csvText);
  if (rows.length < 2) return {};
  return rowsToProjectDocsMap(rows);
}
