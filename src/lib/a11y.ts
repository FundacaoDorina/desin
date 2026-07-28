import type { TimelineItemColor } from "@/types/project";

export function getTimelineColorName(color: TimelineItemColor): string {
  switch (color) {
    case "success":
      return "Verde";
    case "warning":
      return "Amarelo";
    case "suspended":
    case "closed":
      return "Cinza";
    case "muted":
      return "Cinza claro";
    default:
      return "Cinza claro";
  }
}

export function getTimelineStatusLabel(color: TimelineItemColor): string {
  const colorName = getTimelineColorName(color);

  switch (color) {
    case "success":
      return `${colorName} — Concluído`;
    case "warning":
      return `${colorName} — Em andamento`;
    case "suspended":
      return `${colorName} — Suspenso`;
    case "closed":
      return `${colorName} — Encerrado`;
    case "muted":
      return `${colorName} — Pendente`;
    default:
      return `${colorName} — Pendente`;
  }
}
