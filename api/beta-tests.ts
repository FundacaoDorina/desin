import { type ApiRequest, type ApiResponse, guardAuthenticatedGet, sendServerError } from "./_lib/http.js";
import { BETA_TESTS_PROJECT_ID, BETA_TESTS_SHEET_NAME, rowsToBetaTests } from "./_lib/parsers.js";
import { getSheetRows } from "./_lib/sheets.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!guardAuthenticatedGet(req, res)) return;

  try {
    const rows = await getSheetRows(BETA_TESTS_SHEET_NAME);
    return res.status(200).json(rowsToBetaTests(rows, BETA_TESTS_PROJECT_ID));
  } catch (error) {
    return sendServerError(res, "correções em beta", error);
  }
}
