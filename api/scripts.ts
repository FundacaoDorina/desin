import { extractBearerToken, verifyAccessToken } from "./_lib/auth";
import { createHeaderMap, getCellByHeader, getSheetRows } from "./_lib/sheets";

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
    const rows = await getSheetRows("scripts");
    if (rows.length < 2) return res.status(200).json([]);

    const headerMap = createHeaderMap(rows[0]);
    const scripts = rows.slice(1).flatMap((cells) => {
      const id = getCellByHeader(cells, headerMap, "id", 0).trim();
      const name = getCellByHeader(cells, headerMap, "name", 1).trim();
      const summary = getCellByHeader(cells, headerMap, "summary", 2).trim();
      const howItWorks = getCellByHeader(cells, headerMap, "how_it_works", 3).trim();
      const usage = getCellByHeader(cells, headerMap, "usage", 4).trim();
      const link = getCellByHeader(cells, headerMap, "link", 5).trim();

      if (!id || !name) return [];
      return [{ id, name, summary, howItWorks, usage, link: link || undefined }];
    });

    return res.status(200).json(scripts);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao buscar scripts.";
    return res.status(500).json({ error: message });
  }
}
