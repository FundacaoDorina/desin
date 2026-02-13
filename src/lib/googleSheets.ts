import type { Project, TimelineYear, TimelineItemColor } from "@/types/project";

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
  // Pula o header (primeira linha)
  const dataRows = rows.slice(1);

  const projectsMap = new Map<
    string,
    {
      name: string;
      status: string;
      nextStep: string;
      yearsMap: Map<string, Array<{ text: string; color: TimelineItemColor }>>;
    }
  >();

  for (const cells of dataRows) {
    if (cells.length < 7) continue;

    const projectId = cells[0]?.trim();
    const projectName = cells[1]?.trim();
    const status = cells[2]?.trim();
    const nextStep = cells[3]?.trim();
    const year = cells[4]?.trim();
    const itemText = cells[5]?.trim();
    const itemColor = cells[6]?.trim();

    if (!projectId || !itemText) continue;

    if (!projectsMap.has(projectId)) {
      projectsMap.set(projectId, {
        name: projectName,
        status,
        nextStep,
        yearsMap: new Map(),
      });
    }

    const project = projectsMap.get(projectId)!;

    if (projectName) project.name = projectName;
    if (status) project.status = status;
    if (nextStep) project.nextStep = nextStep;

    if (!project.yearsMap.has(year)) {
      project.yearsMap.set(year, []);
    }

    project.yearsMap.get(year)!.push({
      text: itemText,
      color: mapColorValue(itemColor),
    });
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
