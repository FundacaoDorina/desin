import type { Project } from "@/types/project";

export type ProjectTerminalLabel = "Suspenso" | "Encerrado";

function normalizeStatus(status: string): string {
  return status
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function terminalLabelFromText(status: string): ProjectTerminalLabel | null {
  const normalized = normalizeStatus(status);
  if (!normalized) return null;
  if (normalized.includes("suspens")) return "Suspenso";
  if (normalized.includes("encerrad")) return "Encerrado";
  return null;
}

/**
 * Projeto encerrado/suspenso via coluna `status` ou via `item_status`
 * (ex.: último item marcado como Suspenso).
 */
export function getProjectTerminalLabel(project: Project): ProjectTerminalLabel | null {
  const fromProjectStatus = terminalLabelFromText(project.status);
  if (fromProjectStatus) return fromProjectStatus;

  let fromItems: ProjectTerminalLabel | null = null;
  for (const year of project.timeline) {
    for (const item of year.items) {
      if (item.color === "suspended") fromItems = "Suspenso";
      if (item.color === "closed") fromItems = "Encerrado";
    }
  }
  return fromItems;
}

export function getProjectDisplayStatus(project: Project): string {
  return getProjectTerminalLabel(project) ?? project.status;
}

/**
 * Percentual de conclusão do projeto.
 * Encerrado/suspenso conta como 100%, mesmo com itens pendentes.
 * Retorna null quando não há itens ou o projeto é do tipo scripts.
 */
export function getProjectProgressPercentage(project: Project): number | null {
  if (project.kind === "scripts") return null;
  if (getProjectTerminalLabel(project)) return 100;

  const allItems = project.timeline.flatMap((y) => y.items);
  if (allItems.length === 0) return null;

  const doneCount = allItems.filter((item) => item.color === "success").length;
  return Math.round((doneCount / allItems.length) * 100);
}
