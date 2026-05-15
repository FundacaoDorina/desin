import { extractBearerToken, verifyAccessToken } from "./_lib/auth";
import { createHeaderMap, getCellByHeader, getSheetRows } from "./_lib/sheets";

type TimelineItemColor = "success" | "warning" | "muted";
interface ApiRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (statusCode: number) => ApiResponse;
  json: (payload: unknown) => void;
}

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
    default:
      return "muted";
  }
}

function unauthorized(res: ApiResponse) {
  return res.status(401).json({ error: "Acesso não autorizado." });
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
    const rows = await getSheetRows("roadmap");
    if (rows.length < 2) return res.status(200).json([]);

    const header = rows[0];
    const dataRows = rows.slice(1);
    const headerMap = createHeaderMap(header);

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
      const projectId = getCellByHeader(cells, headerMap, "project_id", 0).trim();
      const projectName = getCellByHeader(cells, headerMap, "project_name", 1).trim();
      const status = getCellByHeader(cells, headerMap, "status", 2).trim();
      const nextStep = getCellByHeader(cells, headerMap, "next_step", 3).trim();
      const year = getCellByHeader(cells, headerMap, "year", 4).trim();
      const itemText = getCellByHeader(cells, headerMap, "item", 5).trim();
      const itemColor = getCellByHeader(cells, headerMap, "item_status", 6).trim();
      const documentationContent =
        getCellByHeader(cells, headerMap, "documentation_content", 7).trim() ||
        getCellByHeader(cells, headerMap, "documentation_url", 7).trim();
      const kindValue = getCellByHeader(cells, headerMap, "kind", 8).trim().toLowerCase();
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
      project.kind = kind;

      if (itemText) {
        if (!project.yearsMap.has(year)) project.yearsMap.set(year, []);
        project.yearsMap.get(year)!.push({
          text: itemText,
          color: mapColorValue(itemColor),
        });
      }
    }

    const projects = Array.from(projectsMap.entries()).map(([id, projectData]) => {
      const timeline = Array.from(projectData.yearsMap.entries())
        .map(([year, items]) => ({ year, items }))
        .sort((a, b) => Number.parseInt(a.year, 10) - Number.parseInt(b.year, 10));

      return {
        id,
        name: projectData.name,
        status: projectData.status,
        nextStep: projectData.nextStep,
        documentationContent: projectData.documentationContent,
        kind: projectData.kind,
        timeline,
      };
    });

    return res.status(200).json(projects);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao buscar projetos.";
    return res.status(500).json({ error: message });
  }
}
