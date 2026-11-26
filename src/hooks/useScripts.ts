import { useQuery } from "@tanstack/react-query";
import { apiGet, shouldRetry } from "@/lib/api";
import type { ScriptItem } from "@/types/script";

export function useScripts() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["scripts"],
    queryFn: () => apiGet<ScriptItem[]>("scripts"),
    staleTime: 5 * 60 * 1000,
    retry: shouldRetry,
    refetchOnWindowFocus: true,
  });

  return {
    scripts: data ?? [],
    isLoading,
    isError,
    error,
    isFromSheet: !!data,
    isConfigured: true,
    refetch,
  };
}
