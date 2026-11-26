import { useQuery } from "@tanstack/react-query";
import { apiGet, shouldRetry } from "@/lib/api";
import { BETA_TESTS_PROJECT_ID } from "@/lib/betaTests";
import type { BetaTestItem } from "@/types/betaTest";

export function useBetaTests(projectId?: string | null) {
  const hasBetaTestsArea = projectId === BETA_TESTS_PROJECT_ID;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["beta-tests"],
    queryFn: () => apiGet<BetaTestItem[]>("beta-tests"),
    enabled: hasBetaTestsArea,
    staleTime: 60 * 1000,
    retry: shouldRetry,
    refetchOnWindowFocus: true,
  });

  const allItems = data ?? [];
  const items = projectId ? allItems.filter((item) => item.projectId === projectId) : allItems;

  return {
    items,
    isLoading: hasBetaTestsArea && isLoading,
    isError: hasBetaTestsArea && isError,
    error,
    isFromSheet: !!data,
    isConfigured: hasBetaTestsArea,
    refetch,
    hasBetaTestsArea,
  };
}
