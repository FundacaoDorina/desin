import { useQuery } from "@tanstack/react-query";
import { fetchLinearCorrectionsFromSheets } from "@/lib/googleSheets";
import { BETA_TESTS_PROJECT_ID, LINEAR_CORRECTIONS_PROJECT_ID } from "@/lib/betaTests";
import linearCorrectionsData from "@/data/linearCorrections.json";
import type { BetaTestItem } from "@/types/betaTest";

const SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID as string | undefined;
const LINEAR_GID = import.meta.env.VITE_GOOGLE_SHEETS_LINEAR_GID as string | undefined;

export function useLinearCorrections(projectId?: string | null) {
  const shouldLoad =
    projectId === LINEAR_CORRECTIONS_PROJECT_ID || projectId === BETA_TESTS_PROJECT_ID;
  const canFetchFromSheet =
    !!SHEETS_ID &&
    shouldLoad &&
    (!SHEETS_ID.startsWith("2PACX-") || !!LINEAR_GID);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["linear-corrections", SHEETS_ID, LINEAR_GID],
    queryFn: () => fetchLinearCorrectionsFromSheets(SHEETS_ID!, LINEAR_GID),
    enabled: canFetchFromSheet,
    staleTime: 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const allItems: BetaTestItem[] = data ?? (linearCorrectionsData as BetaTestItem[]);
  const items = allItems.filter((item) => item.projectId === LINEAR_CORRECTIONS_PROJECT_ID);

  return {
    items,
    isLoading: canFetchFromSheet && isLoading,
    isError: canFetchFromSheet && isError,
    error,
    isFromSheet: !!data,
    isConfigured: canFetchFromSheet,
    refetch,
    hasLinearCorrectionsArea: projectId === LINEAR_CORRECTIONS_PROJECT_ID,
  };
}
