import type { TimelineItemColor } from "@/types/project";

export function getTimelineStatusLabel(color: TimelineItemColor): string {
  switch (color) {
    case "success":
      return "Concluído";
    case "warning":
      return "Em andamento";
    case "suspended":
      return "Suspenso";
    case "closed":
      return "Encerrado";
    case "muted":
      return "Pendente";
    default:
      return "Pendente";
  }
}
