import { type ApiRequest, type ApiResponse, guardAuthenticatedGet, sendServerError } from "./_lib/http.js";
import { rowsToProjectDocsMap } from "./_lib/parsers.js";
import { getSheetRows } from "./_lib/sheets.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!guardAuthenticatedGet(req, res)) return;

  try {
    const rows = await getSheetRows("project_docs");
    return res.status(200).json(rowsToProjectDocsMap(rows));
  } catch (error) {
    return sendServerError(res, "documentação", error);
  }
}
