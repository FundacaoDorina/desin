import { google } from "googleapis";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável ${name} não configurada.`);
  }
  return value;
}

async function getSheetsClient() {
  const email = requiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = requiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  await auth.authorize();
  return google.sheets({ version: "v4", auth });
}

export async function getSheetRows(sheetName: string): Promise<string[][]> {
  const spreadsheetId = requiredEnv("GOOGLE_SHEETS_ID");
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });

  const rows = response.data.values ?? [];
  return rows.map((cells) => cells.map((cell) => `${cell ?? ""}`));
}

export function createHeaderMap(header: string[]): Map<string, number> {
  return new Map(header.map((column, index) => [column.trim().toLowerCase(), index]));
}

export function getCellByHeader(
  cells: string[],
  headerMap: Map<string, number>,
  headerName: string,
  fallbackIndex: number
): string {
  const index = headerMap.get(headerName);
  if (index === undefined) return cells[fallbackIndex] ?? "";
  return cells[index] ?? "";
}
