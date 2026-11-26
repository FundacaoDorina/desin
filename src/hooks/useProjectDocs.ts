import { useQuery } from "@tanstack/react-query";
import { apiGet, shouldRetry } from "@/lib/api";

export function useProjectDocs() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["project-docs"],
    queryFn: () => apiGet<Record<string, string>>("project-docs"),
    staleTime: 5 * 60 * 1000,
    retry: shouldRetry,
    refetchOnWindowFocus: true,
  });

  return {
    projectDocs: data ?? {},
    isLoading,
    isError,
    error,
    refetch,
  };
}
