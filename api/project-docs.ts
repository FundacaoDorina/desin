import { extractBearerToken, verifyAccessToken } from "./_lib/auth";
import { createHeaderMap, getCellByHeader, getSheetRows } from "./_lib/sheets";

const DOC_TITLE_PREFIX = "[[DOC_TITLE]]";
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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const token = extractBearerToken(req);
  if (!token || !verifyAccessToken(token)) {
    return unauthorized(res);
  }

  try {
    const rows = await getSheetRows("project_docs");
    if (rows.length < 2) return res.status(200).json({});

    const headerMap = createHeaderMap(rows[0]);
    const parsedRows = rows
      .slice(1)
      .map((cells) => {
        const projectId = getCellByHeader(cells, headerMap, "project_id", 0).trim();
        const orderRaw = getCellByHeader(cells, headerMap, "order", 1).trim();
        const title = getCellByHeader(cells, headerMap, "title", 2).trim();
        const content = getCellByHeader(cells, headerMap, "content", 3).trim();

        if (!projectId || !content) return null;
        return {
          projectId,
          order: Number.parseInt(orderRaw || "9999", 10),
          title: title || undefined,
          content,
        };
      })
      .filter((row): row is { projectId: string; order: number; title?: string; content: string } => !!row)
      .sort((a, b) => a.order - b.order);

    const docsByProject: Record<string, string> = {};
    for (const row of parsedRows) {
      const block = row.title ? `${DOC_TITLE_PREFIX}${row.title}\n${row.content}` : row.content;
      docsByProject[row.projectId] = docsByProject[row.projectId]
        ? `${docsByProject[row.projectId]}\n\n${block}`
        : block;
    }

    return res.status(200).json(docsByProject);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao buscar documentação.";
    return res.status(500).json({ error: message });
  }
}
