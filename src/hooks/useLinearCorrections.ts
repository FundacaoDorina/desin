import { useQuery } from "@tanstack/react-query";
import { apiGet, shouldRetry } from "@/lib/api";
import { BETA_TESTS_PROJECT_ID, LINEAR_CORRECTIONS_PROJECT_ID } from "@/lib/betaTests";
import type { BetaTestItem } from "@/types/betaTest";

export function useLinearCorrections(projectId?: string | null) {
  const shouldLoad =
    projectId === LINEAR_CORRECTIONS_PROJECT_ID || projectId === BETA_TESTS_PROJECT_ID;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["linear-corrections"],
    queryFn: () => apiGet<BetaTestItem[]>("linear-corrections"),
    enabled: shouldLoad,
    staleTime: 60 * 1000,
    retry: shouldRetry,
    refetchOnWindowFocus: true,
  });

  const items = (data ?? []).filter((item) => item.projectId === LINEAR_CORRECTIONS_PROJECT_ID);

  return {
    items,
    isLoading: shouldLoad && isLoading,
    isError: shouldLoad && isError,
    error,
    isFromSheet: !!data,
    isConfigured: shouldLoad,
    refetch,
    hasLinearCorrectionsArea: projectId === LINEAR_CORRECTIONS_PROJECT_ID,
  };
}
