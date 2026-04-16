import { useQuery } from "@tanstack/react-query";
import { fetchScriptsFromSheets } from "@/lib/googleSheets";
import scriptsData from "@/data/scripts.json";
import type { ScriptItem } from "@/types/script";

const SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID as string | undefined;
const SCRIPTS_GID = import.meta.env.VITE_GOOGLE_SHEETS_SCRIPTS_GID as string | undefined;

export function useScripts() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["scripts", SHEETS_ID, SCRIPTS_GID],
    queryFn: () => fetchScriptsFromSheets(SHEETS_ID!, SCRIPTS_GID),
    enabled: !!SHEETS_ID,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const scripts: ScriptItem[] = data ?? (scriptsData as ScriptItem[]);

  return {
    scripts,
    isLoading: !!SHEETS_ID && isLoading,
    isError,
    error,
    isFromSheet: !!data,
    refetch,
  };
}
