import { useQuery } from "@tanstack/react-query";
import { fetchProjectsFromSheets } from "@/lib/googleSheets";
import projectsData from "@/data/projects.json";
import type { Project } from "@/types/project";

const SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID as string | undefined;

export function useProjects() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["projects", SHEETS_ID],
    queryFn: () => fetchProjectsFromSheets(SHEETS_ID!),
    enabled: !!SHEETS_ID,
    staleTime: 5 * 60 * 1000, // Cache de 5 minutos
    retry: 2,
    refetchOnWindowFocus: true, // Atualiza ao voltar para a aba
  });

  // Se não tem Sheet ID configurado ou o fetch falhou, usa o JSON estático
  const projects: Project[] = data ?? (projectsData as Project[]);

  return {
    projects,
    isLoading: !!SHEETS_ID && isLoading,
    isError,
    error,
    isFromSheet: !!data,
    isConfigured: !!SHEETS_ID,
    refetch,
  };
}
