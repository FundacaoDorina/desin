interface ProjectDetailProps {
  name: string;
  status: string;
  nextStep: string;
}

const ProjectDetail = ({ name, status, nextStep }: ProjectDetailProps) => {
  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10">
      <div className="bg-primary inline-block px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5">
        <h2 className="text-primary-foreground font-bebas font-bold text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
          {name}
        </h2>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div>
          <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl bg-sidebar-light px-3 py-1 rounded leading-loose">
            Status:
          </span>
          <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl ml-3 leading-loose">
            {status}
          </span>
        </div>
        <div>
          <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl bg-sidebar-light px-3 py-1 rounded leading-loose">
            Próximo passo:
          </span>
          <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl ml-3 leading-loose">
            {nextStep}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
