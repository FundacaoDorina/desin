import type { TimelineYear } from "@/types/project";

interface ProjectListProps {
  projects: { id: string; name: string; timeline: TimelineYear[]; }[];
  selectedProject: string | null;
  onSelectProject: (id: string) => void;
  minimized?: boolean;
}

const ProjectList = ({
  projects,
  selectedProject,
  onSelectProject,
  minimized = false,
}: ProjectListProps) => {
  if (minimized) {
    return (
      <div className="bg-sidebar-light p-2 rounded w-full md:w-fit md:max-w-[200px] lg:max-w-[250px]">
        <div className="bg-sidebar-dark px-2 py-1 mb-1 rounded">
          <h2 className="text-card-foreground font-bebas font-bold text-lg leading-none">
            Projetos
          </h2>
        </div>
        <nav className="space-y-1">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={`w-full text-left px-2 py-1 font-bebas font-bold text-lg leading-none transition-colors rounded whitespace-nowrap overflow-hidden text-ellipsis ${
                selectedProject === project.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              <span className="block truncate">
                {project.name}
                {(() => {
                  let completeCount = 0;
                  let totalCount = 0;
                  project.timeline.forEach((projectYear) => {
                    completeCount = completeCount + projectYear.items.filter((item) => item.color === "success").length;
                    totalCount = totalCount + projectYear.items.length;
                  });
                  if (totalCount === 0) return '';
                  const percentage = ((completeCount / totalCount) * 100).toFixed(0);
                  return ` (${percentage}%)`;
                })()}
              </span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10 w-full block">
      <div className="bg-primary inline-block px-6 py-3 md:px-8 md:py-4">
        <h2 className="text-primary-foreground font-bebas font-bold text-4xl md:text-5xl lg:text-6xl">
          Projetos
        </h2>
      </div>
      <nav className="space-y-4 md:space-y-6 lg:space-y-8">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className="block w-full text-left font-bebas font-bold text-card-foreground hover:bg-primary hover:text-primary-foreground px-4 py-2 transition-colors rounded"
            style={{
              fontSize: 'calc(4rem - 2px)',
            }}
          >
            {project.name}
            {(() => {
              let completeCount = 0;
              let totalCount = 0;
              project.timeline.forEach((projectYear) => {
                completeCount = completeCount + projectYear.items.filter((item) => item.color === "success").length;
                totalCount = totalCount + projectYear.items.length;
              });
              if (totalCount === 0) return '';
              const percentage = ((completeCount / totalCount) * 100).toFixed(0);
              return ` (${percentage}%)`;
            })()}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProjectList;
