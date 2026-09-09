import { useEffect, useRef } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import type { BetaDifficulty, BetaTestItem } from "@/types/betaTest";
import {
  getDifficultyClass,
  getDifficultyLabel,
  getEmBetaClass,
  getEmBetaLabel,
  getStatusClass,
  getStatusLabel,
} from "@/lib/betaTests";

interface BetaTestsViewProps {
  items: BetaTestItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onBack: () => void;
  title?: string;
  headingId?: string;
  loadingMessage?: string;
  emptyMessage?: string;
  retryAriaLabel?: string;
  caption?: string;
}

const DIFFICULTY_LEGEND: Array<{ id: BetaDifficulty; label: string; className: string }> = [
  { id: "facil", label: "Fácil", className: "bg-beta-easy text-beta-easy-foreground" },
  { id: "medio", label: "Médio", className: "bg-beta-medium text-beta-medium-foreground" },
  {
    id: "medio-dificil",
    label: "Médio difícil",
    className: "bg-beta-medium-hard text-beta-medium-hard-foreground",
  },
  { id: "dificil", label: "Difícil", className: "bg-beta-hard text-beta-hard-foreground" },
];

const BetaTestsView = ({
  items,
  isLoading,
  isError,
  onRetry,
  onBack,
  title = "Correções em beta",
  headingId = "correcoes-em-beta-heading",
  loadingMessage = "Carregando correções em beta...",
  emptyMessage = "Nenhuma correção cadastrada para correções em beta.",
  retryAriaLabel = "Tentar carregar novamente as correções em beta da planilha",
  caption = "Tabela de correções em teste na versão beta. Colunas: correção com dificuldade, status, prioridade de 1 a 5, e se já está em beta.",
}: BetaTestsViewProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className="space-y-3 md:space-y-4" aria-labelledby={headingId}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="bg-sidebar-light text-card-foreground hover:bg-primary hover:text-primary-foreground font-bebas font-bold text-xl md:text-2xl px-4 py-2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Voltar
        </button>
        <h3
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="text-card-foreground font-bebas font-bold text-3xl md:text-4xl lg:text-5xl rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {title}
        </h3>
      </div>

      <ul
        className="flex flex-wrap gap-3 md:gap-4 list-none p-0 m-0"
        aria-label="Legenda da escala de dificuldade das correções"
      >
        {DIFFICULTY_LEGEND.map((item) => (
          <li
            key={item.id}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded font-bebas text-sm md:text-base ${item.className}`}
          >
            <span className="inline-block w-3 h-3 rounded-sm bg-current opacity-80" aria-hidden="true" />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      <p className="text-card-foreground text-base md:text-lg">
        As cores da coluna Correção indicam a dificuldade: verde (fácil), amarelo-claro (médio),
        amarelo-escuro (médio difícil) e vermelho (difícil). Cada linha também traz o nome da
        dificuldade por escrito.
      </p>

      {isError && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded bg-warning/20 text-warning-foreground border border-warning/30"
          role="alert"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span className="font-bebas text-lg">
            Não foi possível carregar da planilha. Exibindo dados locais.
          </span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              aria-label={retryAriaLabel}
              className="ml-auto flex items-center gap-1 px-3 py-1 rounded bg-warning/30 hover:bg-warning/50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span className="font-bebas text-sm">Tentar novamente</span>
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground font-bebas text-xl" role="status">
          {loadingMessage}
        </p>
      ) : items.length === 0 ? (
        <p className="text-card-foreground font-bebas text-2xl">
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[640px]">
            <caption className="sr-only">
              {caption}
            </caption>
            <thead>
              <tr className="bg-sidebar-dark">
                <th
                  scope="col"
                  className="text-left text-card-foreground font-bebas font-bold text-xl md:text-2xl px-3 py-2 md:px-4 md:py-3"
                >
                  Correção
                </th>
                <th
                  scope="col"
                  className="text-left text-card-foreground font-bebas font-bold text-xl md:text-2xl px-3 py-2 md:px-4 md:py-3"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="text-left text-card-foreground font-bebas font-bold text-xl md:text-2xl px-3 py-2 md:px-4 md:py-3 whitespace-nowrap"
                >
                  Prioridade (1 a 5)
                </th>
                <th
                  scope="col"
                  className="text-left text-card-foreground font-bebas font-bold text-xl md:text-2xl px-3 py-2 md:px-4 md:py-3"
                >
                  Em beta
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isFinished = item.status === "finalizado";
                const isInBeta = item.emBeta === "sim";
                const difficultyLabel = item.dificuldade
                  ? getDifficultyLabel(item.dificuldade)
                  : isFinished
                    ? "Dificuldade não informada"
                    : "Dificuldade não classificada";
                const inBetaRowClass = "bg-background text-foreground";

                return (
                  <tr
                    key={item.id}
                    className={isInBeta ? "border-b border-foreground/20" : "border-b border-sidebar-light"}
                  >
                    <td
                      className={`px-3 py-3 md:px-4 md:py-4 font-bebas font-bold text-lg md:text-xl lg:text-2xl ${
                        isInBeta
                          ? inBetaRowClass
                          : getDifficultyClass(item.dificuldade, isFinished)
                      }`}
                    >
                      <span className="block">{item.correcao}</span>
                      <span className="block mt-1 text-[0.65em] font-normal leading-none opacity-90">
                        Dificuldade: {difficultyLabel}
                      </span>
                    </td>
                    <td className={`px-3 py-3 md:px-4 md:py-4 align-middle ${isInBeta ? inBetaRowClass : ""}`}>
                      <span
                        className={`inline-flex items-center px-4 py-2 md:px-5 md:py-3 rounded font-bebas font-bold text-xl md:text-2xl ${
                          isInBeta ? "bg-background text-foreground" : getStatusClass(item.status)
                        }`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-3 md:px-4 md:py-4 font-bebas font-bold text-xl md:text-2xl ${
                        isInBeta
                          ? inBetaRowClass
                          : isFinished
                            ? "bg-beta-finished text-beta-finished-foreground"
                            : "text-card-foreground"
                      }`}
                    >
                      <span className="sr-only">Prioridade </span>
                      {item.prioridade}
                    </td>
                    <td className={`px-3 py-3 md:px-4 md:py-4 align-middle ${isInBeta ? inBetaRowClass : ""}`}>
                      <span
                        className={`inline-flex items-center px-4 py-2 md:px-5 md:py-3 rounded font-bebas font-bold text-xl md:text-2xl ${
                          isInBeta ? "bg-background text-foreground" : getEmBetaClass(item.emBeta)
                        }`}
                      >
                        {getEmBetaLabel(item.emBeta)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default BetaTestsView;
