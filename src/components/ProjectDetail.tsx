import { Plus } from "lucide-react";

interface ProjectDetailProps {
  name: string;
  status: string;
  nextStep: string;
  documentationContent?: string;
  isDocumentationOpen: boolean;
  onToggleDocumentation: () => void;
}

const ProjectDetail = ({
  name,
  status,
  nextStep,
  documentationContent,
  isDocumentationOpen,
  onToggleDocumentation,
}: ProjectDetailProps) => {
  const hasDocumentation = !!documentationContent?.trim();

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10">
      <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
        <div className="bg-primary inline-block px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5">
          <h2 className="text-primary-foreground font-bebas font-bold text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            {name}
          </h2>
        </div>
        {hasDocumentation && (
          <button
            type="button"
            onClick={onToggleDocumentation}
            className="bg-primary text-primary-foreground hover:opacity-90 transition-opacity rounded p-2 md:p-3"
            title={isDocumentationOpen ? "Fechar documentação" : "Abrir documentação"}
            aria-label={isDocumentationOpen ? "Fechar documentação" : "Abrir documentação"}
          >
            <Plus
              className={`w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 transition-transform ${
                isDocumentationOpen ? "rotate-45" : ""
              }`}
            />
          </button>
        )}
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
          <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl bg-sidebar-light px-3 py-1 rounded leading-loose">
            Status:
          </span>
          <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl md:ml-3 leading-loose">
            {status}
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
          <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl bg-sidebar-light px-3 py-1 rounded leading-loose">
            Próximo passo:
          </span>
          <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl md:ml-3 leading-loose">
            {nextStep}
          </span>
        </div>
      </div>

    </div>
  );
};

export default ProjectDetail;
