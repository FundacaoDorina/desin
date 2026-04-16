import { useState } from "react";
import Header from "@/components/Header";
import ProjectList from "@/components/ProjectList";
import ProjectDetail from "@/components/ProjectDetail";
import ScriptsDetail from "@/components/ScriptsDetail";
import Timeline from "@/components/Timeline";
import { useProjects } from "@/hooks/useProjects";
import { useScripts } from "@/hooks/useScripts";
import { useProjectDocs } from "@/hooks/useProjectDocs";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";

const DOC_TITLE_PREFIX = "[[DOC_TITLE]]";

function renderInlineFormatting(text: string) {
  const tokens = text.split(
    /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/
  );

  return tokens.map((token, index) => {
    if (!token) return null;

    const linkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <a
          key={`link-${index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80"
        >
          {label}
        </a>
      );
    }

    if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      return <strong key={`strong-${index}`}>{token.slice(2, -2)}</strong>;
    }

    if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      return <em key={`em-${index}`}>{token.slice(1, -1)}</em>;
    }

    return <span key={`text-${index}`}>{token}</span>;
  });
}

function renderDocumentationBlocks(documentation: string) {
  return documentation.split(/\n{2,}/).map((block, index) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return null;

    const [firstLine, ...restLines] = trimmedBlock.split("\n");
    const hasTitle = firstLine.startsWith(DOC_TITLE_PREFIX);
    const title = hasTitle ? firstLine.replace(DOC_TITLE_PREFIX, "").trim() : "";
    const content = hasTitle ? restLines.join("\n").trim() : trimmedBlock;

    return (
      <div key={`${index}-${firstLine}`} className="space-y-1 md:space-y-2">
        {hasTitle && (
          <h4 className="font-bebas font-bold text-card-foreground text-2xl md:text-3xl">
            {renderInlineFormatting(title)}
          </h4>
        )}
        {content &&
          (() => {
            const lines = content.split("\n");
            const hasList = lines.some((line) => line.trim().startsWith("- "));

            if (!hasList) {
              return (
                <p className="text-card-foreground text-base md:text-lg whitespace-pre-line">
                  {lines.map((line, lineIndex) => (
                    <span key={`line-${lineIndex}`}>
                      {renderInlineFormatting(line)}
                      {lineIndex < lines.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              );
            }

            return (
              <div className="space-y-2 text-card-foreground text-base md:text-lg">
                <ul className="list-disc pl-6 space-y-1">
                  {lines
                    .filter((line) => line.trim().startsWith("- "))
                    .map((line, listIndex) => (
                      <li key={`li-${listIndex}`}>
                        {renderInlineFormatting(line.trim().slice(2))}
                      </li>
                    ))}
                </ul>
                {lines.some((line) => line.trim() && !line.trim().startsWith("- ")) && (
                  <p>
                    {lines
                      .filter((line) => line.trim() && !line.trim().startsWith("- "))
                      .map((line, textIndex, arr) => (
                        <span key={`mixed-${textIndex}`}>
                          {renderInlineFormatting(line)}
                          {textIndex < arr.length - 1 && <br />}
                        </span>
                      ))}
                  </p>
                )}
              </div>
            );
          })()}
      </div>
    );
  });
}

const Index = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);

  const { projects, isLoading, isError, isFromSheet, refetch } = useProjects();
  const { scripts } = useScripts();
  const { projectDocs } = useProjectDocs();
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const isScriptsProject = selectedProject?.kind === "scripts";
  const selectedDocumentation =
    selectedProject ? projectDocs[selectedProject.id] ?? selectedProject.documentationContent : "";

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setIsDocumentationOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="bg-card mx-4 my-6 md:mx-8 md:my-8 lg:mx-12 lg:my-10 p-3 md:p-5 lg:p-7 xl:p-10 min-h-[80vh]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground font-bebas text-xl">Carregando projetos...</p>
          </div>
        ) : (
          <>
            {isError && (
              <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded bg-warning/20 text-warning-foreground border border-warning/30">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="font-bebas text-lg">
                  Não foi possível carregar da planilha. Exibindo dados locais.
                </span>
                <button
                  onClick={() => refetch()}
                  className="ml-auto flex items-center gap-1 px-3 py-1 rounded bg-warning/30 hover:bg-warning/50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="font-bebas text-sm">Tentar novamente</span>
                </button>
              </div>
            )}

            {!selectedProject ? (
              <ProjectList
                projects={projects}
                selectedProject={selectedProjectId}
                onSelectProject={handleSelectProject}
              />
            ) : (
              <>
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  <aside className="flex-shrink-0">
                    <ProjectList
                      projects={projects}
                      selectedProject={selectedProjectId}
                      onSelectProject={handleSelectProject}
                      minimized
                    />
                  </aside>
                  <div className="flex-1">
                    {isScriptsProject ? (
                      <ScriptsDetail scripts={scripts} />
                    ) : (
                      <ProjectDetail
                        name={selectedProject.name}
                        status={selectedProject.status}
                        nextStep={selectedProject.nextStep}
                        documentationContent={selectedDocumentation}
                        isDocumentationOpen={isDocumentationOpen}
                        onToggleDocumentation={() => setIsDocumentationOpen((prev) => !prev)}
                      />
                    )}
                  </div>
                </div>
                {!isScriptsProject && (
                  isDocumentationOpen ? (
                    <section className="bg-sidebar-light rounded p-4 md:p-6 lg:p-8 mt-6">
                      <h3 className="text-card-foreground font-bebas font-bold text-3xl md:text-4xl lg:text-5xl mb-3 md:mb-4">
                        Documentação
                      </h3>
                      {selectedDocumentation ? (
                        <div className="space-y-4 md:space-y-5">
                          {renderDocumentationBlocks(selectedDocumentation)}
                        </div>
                      ) : (
                        <p className="text-card-foreground text-base md:text-lg whitespace-pre-line">
                          Sem documentação cadastrada para este projeto.
                        </p>
                      )}
                    </section>
                  ) : (
                    <Timeline timeline={selectedProject.timeline} />
                  )
                )}
              </>
            )}
          </>
        )}
      </main>

      {isFromSheet && (
        <footer className="bg-background flex items-center justify-center gap-2 px-4 py-3 text-white/40">
          <span className="font-bebas text-sm">
            Dados sincronizados com Google Sheets
          </span>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 px-2 py-1 rounded hover:text-white/70 transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </footer>
      )}
    </div>
  );
};

export default Index;
