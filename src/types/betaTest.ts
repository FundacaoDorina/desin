export type BetaDifficulty = "facil" | "medio" | "medio-dificil" | "dificil";

export type BetaStatus = "nao-iniciado" | "em-correcao" | "finalizado";

export type BetaFlag = "sim" | "nao";

export interface BetaTestItem {
  id: string;
  projectId: string;
  correcao: string;
  dificuldade: BetaDifficulty | null;
  status: BetaStatus;
  prioridade: number;
  emBeta: BetaFlag;
}
