import type { BetaDifficulty, BetaFlag, BetaStatus } from "@/types/betaTest";

export const BETA_TESTS_PROJECT_ID = "plataforma-braille";
export const LINEAR_CORRECTIONS_PROJECT_ID = "linear";

export function getDifficultyLabel(difficulty: BetaDifficulty): string {
  switch (difficulty) {
    case "facil":
      return "Fácil";
    case "medio":
      return "Médio";
    case "medio-dificil":
      return "Médio difícil";
    case "dificil":
      return "Difícil";
  }
}

export function getStatusLabel(status: BetaStatus): string {
  switch (status) {
    case "nao-iniciado":
      return "Não iniciado";
    case "em-correcao":
      return "Em correção";
    case "finalizado":
      return "Finalizado";
  }
}

export function getEmBetaLabel(flag: BetaFlag): string {
  return flag === "sim" ? "Sim" : "Não";
}

export function getDifficultyClass(difficulty: BetaDifficulty | null, isFinished: boolean): string {
  if (isFinished) {
    return "bg-beta-finished text-beta-finished-foreground";
  }
  if (!difficulty) {
    return "text-card-foreground";
  }
  switch (difficulty) {
    case "facil":
      return "bg-beta-easy text-beta-easy-foreground";
    case "medio":
      return "bg-beta-medium text-beta-medium-foreground";
    case "medio-dificil":
      return "bg-beta-medium-hard text-beta-medium-hard-foreground";
    case "dificil":
      return "bg-beta-hard text-beta-hard-foreground";
  }
}

export function getStatusClass(status: BetaStatus): string {
  switch (status) {
    case "em-correcao":
      return "bg-primary text-primary-foreground";
    case "finalizado":
      return "bg-background text-foreground";
    case "nao-iniciado":
    default:
      return "bg-sidebar-light text-card-foreground";
  }
}

export function getEmBetaClass(flag: BetaFlag): string {
  return flag === "sim"
    ? "bg-beta-flag-yes text-beta-flag-yes-foreground"
    : "bg-beta-flag-no text-beta-flag-no-foreground";
}
