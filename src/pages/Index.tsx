import { useState } from "react";
import Header from "@/components/Header";
import ProjectList from "@/components/ProjectList";
import ProjectDetail from "@/components/ProjectDetail";
import Timeline from "@/components/Timeline";
import { useProjects } from "@/hooks/useProjects";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";

const Index = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { projects, isLoading, isError, isFromSheet, refetch } = useProjects();
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
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
                    <ProjectDetail
                      name={selectedProject.name}
                      status={selectedProject.status}
                      nextStep={selectedProject.nextStep}
                    />
                  </div>
                </div>
                <Timeline timeline={selectedProject.timeline} />
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
