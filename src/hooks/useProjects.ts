import { useQuery } from "@tanstack/react-query";
import { apiGet, shouldRetry } from "@/lib/api";
import type { Project } from "@/types/project";

export function useProjects() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiGet<Project[]>("projects"),
    staleTime: 60 * 1000,
    retry: shouldRetry,
    refetchOnWindowFocus: true,
  });

  return {
    projects: data ?? [],
    isLoading,
    isError,
    error,
    isFromSheet: !!data,
    refetch,
  };
}
