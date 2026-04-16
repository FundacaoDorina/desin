import { useQuery } from "@tanstack/react-query";
import { fetchProjectDocsFromSheets } from "@/lib/googleSheets";
import docsData from "@/data/projectDocs.json";

const SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID as string | undefined;
const DOCS_GID = import.meta.env.VITE_GOOGLE_SHEETS_DOCS_GID as string | undefined;
const DOC_TITLE_PREFIX = "[[DOC_TITLE]]";

function fallbackDocsMap(): Record<string, string> {
  const rows = docsData as Array<{
    project_id: string;
    order: number;
    title?: string;
    content: string;
  }>;

  const grouped = [...rows].sort((a, b) => a.order - b.order).reduce<Record<string, string>>((acc, row) => {
    const block = row.title
      ? `${DOC_TITLE_PREFIX}${row.title}\n${row.content}`
      : row.content;
    acc[row.project_id] = acc[row.project_id] ? `${acc[row.project_id]}\n\n${block}` : block;
    return acc;
  }, {});

  return grouped;
}

export function useProjectDocs() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["project-docs", SHEETS_ID, DOCS_GID],
    queryFn: () => fetchProjectDocsFromSheets(SHEETS_ID!, DOCS_GID),
    enabled: !!SHEETS_ID,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const projectDocs = data ?? fallbackDocsMap();

  return {
    projectDocs,
    isLoading: !!SHEETS_ID && isLoading,
    isError,
    error,
    refetch,
  };
}
