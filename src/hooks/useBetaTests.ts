import { useQuery } from "@tanstack/react-query";
import { fetchBetaTestsFromSheets } from "@/lib/googleSheets";
import { BETA_TESTS_PROJECT_ID } from "@/lib/betaTests";
import betaTestsData from "@/data/betaTests.json";
import type { BetaTestItem } from "@/types/betaTest";

const SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID as string | undefined;
const BETA_GID = import.meta.env.VITE_GOOGLE_SHEETS_BETA_GID as string | undefined;

export function useBetaTests(projectId?: string | null) {
  const canFetchFromSheet =
    !!SHEETS_ID &&
    projectId === BETA_TESTS_PROJECT_ID &&
    (!SHEETS_ID.startsWith("2PACX-") || !!BETA_GID);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["beta-tests", SHEETS_ID, BETA_GID],
    queryFn: () => fetchBetaTestsFromSheets(SHEETS_ID!, BETA_GID),
    enabled: canFetchFromSheet,
    staleTime: 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const allItems: BetaTestItem[] = data ?? (betaTestsData as BetaTestItem[]);
  const items = projectId ? allItems.filter((item) => item.projectId === projectId) : allItems;

  return {
    items,
    isLoading: canFetchFromSheet && isLoading,
    isError: canFetchFromSheet && isError,
    error,
    isFromSheet: !!data,
    isConfigured: canFetchFromSheet,
    refetch,
    hasBetaTestsArea: projectId === BETA_TESTS_PROJECT_ID,
  };
}
