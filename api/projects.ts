import { type ApiRequest, type ApiResponse, guardAuthenticatedGet, sendServerError } from "./_lib/http.js";
import { rowsToProjects } from "./_lib/parsers.js";
import { getSheetRows } from "./_lib/sheets.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!guardAuthenticatedGet(req, res)) return;

  try {
    const rows = await getSheetRows("roadmap");
    return res.status(200).json(rowsToProjects(rows));
  } catch (error) {
    return sendServerError(res, "projetos", error);
  }
}
