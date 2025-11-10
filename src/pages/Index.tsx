import { useState } from "react";
import Header from "@/components/Header";
import ProjectList from "@/components/ProjectList";
import ProjectDetail from "@/components/ProjectDetail";
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
      <main className="bg-card mx-4 my-6 md:mx-8 md:my-8 lg:mx-12 lg:my-10 p-6 md:p-10 lg:p-14 xl:p-20 min-h-[80vh]">
        {!selectedProject ? (
          <ProjectList
            projects={projects}
            selectedProject={selectedProjectId}
            onSelectProject={handleSelectProject}
          />
        ) : (
          <div className="flex gap-4">
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
                timeline={selectedProject.timeline}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
