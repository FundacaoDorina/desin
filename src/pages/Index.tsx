import { useState } from "react";
import Header from "@/components/Header";
import ProjectList from "@/components/ProjectList";
import ProjectDetail from "@/components/ProjectDetail";
import Timeline from "@/components/Timeline";
import projectsData from "@/data/projects.json";
import type { Project } from "@/types/project";

const Index = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const projects = projectsData as Project[];
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="bg-card mx-4 my-6 md:mx-8 md:my-8 lg:mx-12 lg:my-10 p-3 md:p-5 lg:p-7 xl:p-10 min-h-[80vh]">
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
      </main>
    </div>
  );
};

export default Index;
