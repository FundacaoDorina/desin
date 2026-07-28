import type { MouseEvent } from "react";
import { getProjectProgressPercentage } from "@/lib/projectProgress";
import type { Project } from "@/types/project";

interface ProjectListProps {
  projects: Project[];
  selectedProject: string | null;
  onSelectProject: (id: string) => void;
  minimized?: boolean;
}

function progressLabel(project: Project): string {
  const percentage = getProjectProgressPercentage(project);
  return percentage === null ? "" : ` (${percentage}%)`;
}

const ProjectList = ({
  projects,
  selectedProject,
  onSelectProject,
  minimized = false,
}: ProjectListProps) => {
  const handleSelect = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    onSelectProject(id);
  };

  if (minimized) {
    return (
      <div className="bg-sidebar-light p-2 rounded w-full md:w-fit md:max-w-[200px] lg:max-w-[250px]">
        <div className="bg-sidebar-dark px-2 py-1 mb-1 rounded">
          <h2
            id="lista-projetos-titulo"
            className="text-card-foreground font-bebas font-bold text-lg leading-none rounded"
          >
            Projetos
          </h2>
        </div>
        <nav className="space-y-1" aria-labelledby="lista-projetos-titulo">
          {projects.map((project) => (
            <a
              key={project.id}
              href={`#projeto-${project.id}`}
              onClick={(event) => handleSelect(event, project.id)}
              aria-current={selectedProject === project.id ? "page" : undefined}
              className={`block w-full text-left px-2 py-1 font-bebas font-bold text-lg leading-none transition-colors rounded whitespace-nowrap overflow-hidden text-ellipsis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                selectedProject === project.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              <span className="block truncate">
                {project.name}
                {progressLabel(project)}
              </span>
            </a>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10 w-full block">
      <div className="bg-primary inline-block px-6 py-3 md:px-8 md:py-4">
        <h2
          id="lista-projetos-titulo"
          className="text-primary-foreground font-bebas font-bold text-4xl md:text-5xl lg:text-6xl rounded"
        >
          Projetos
        </h2>
      </div>
      <nav className="space-y-4 md:space-y-6 lg:space-y-8" aria-labelledby="lista-projetos-titulo">
        {projects.map((project) => (
          <a
            key={project.id}
            href={`#projeto-${project.id}`}
            onClick={(event) => handleSelect(event, project.id)}
            aria-current={selectedProject === project.id ? "page" : undefined}
            className="block w-full text-left font-bebas font-bold text-card-foreground hover:bg-primary hover:text-primary-foreground px-4 py-2 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{
              fontSize: "calc(4rem - 2px)",
            }}
          >
            {project.name}
            {progressLabel(project)}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default ProjectList;
