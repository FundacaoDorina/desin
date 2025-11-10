interface ProjectListProps {
  projects: { id: string; name: string }[];
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
      <div className="bg-sidebar-light p-4 rounded">
        <div className="bg-sidebar-dark px-4 py-2 mb-4 rounded">
          <h2 className="text-card-foreground font-bebas font-bold text-lg md:text-xl lg:text-2xl">
            Projetos
          </h2>
        </div>
        <nav className="space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={`w-full text-left px-3 py-2 font-bebas font-bold text-sm md:text-base lg:text-lg transition-colors rounded ${
                selectedProject === project.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              {project.name}
            </button>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10">
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
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProjectList;
