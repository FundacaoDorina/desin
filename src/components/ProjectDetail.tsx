import { useState } from "react";
import type { TimelineYear, TimelineItemColor } from "@/types/project";

interface ProjectDetailProps {
  name: string;
  status: string;
  nextStep: string;
  timeline: TimelineYear[];
}

const ProjectDetail = ({ name, status, nextStep, timeline }: ProjectDetailProps) => {
  const currentYear = new Date().getFullYear();
  const sortedTimeline = [...timeline].sort((a, b) => parseInt(a.year) - parseInt(b.year));
  const lastTwoYears = sortedTimeline.slice(-2).map((t) => t.year);

  const [expandedYears, setExpandedYears] = useState<string[]>(lastTwoYears);

  const toggleYear = (year: string) => {
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const getColorClass = (color: TimelineItemColor) => {
    switch (color) {
      case "success":
        return "bg-success text-success-foreground";
      case "warning":
        return "bg-warning text-warning-foreground";
      case "muted":
        return "bg-sidebar-light text-card-foreground";
      default:
        return "bg-sidebar-light text-card-foreground";
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10">
      <div className="bg-primary inline-block px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5">
        <h2 className="text-primary-foreground font-bebas font-bold text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
          {name}
        </h2>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div>
          <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl bg-sidebar-light px-3 py-1 rounded">
            Status:
          </span>
          <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl ml-3">
            {status}
          </span>
        </div>
        <div>
          <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl bg-sidebar-light px-3 py-1 rounded">
            Próximo passo:
          </span>
          <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl ml-3">
            {nextStep}
          </span>
        </div>
      </div>

      <div className="relative pt-8 md:pt-10 lg:pt-12">
        <div className="flex items-center space-x-8 md:space-x-12 lg:space-x-16 xl:space-x-20 mb-8">
          {sortedTimeline.map((yearData, index) => (
            <div key={yearData.year} className="relative">
              <div className="flex flex-col items-center">
                <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-4">
                  {yearData.year}
                </span>
                <button
                  onClick={() => toggleYear(yearData.year)}
                  className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-card-foreground cursor-pointer hover:scale-110 transition-transform"
                  aria-label={`Toggle ${yearData.year}`}
                />
              </div>
              {index < sortedTimeline.length - 1 && (
                <div className="absolute top-[4.5rem] md:top-[5.5rem] lg:top-[6.5rem] left-full w-8 md:w-12 lg:w-16 xl:w-20 h-1 bg-card-foreground" />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6 md:space-y-8 lg:space-y-10">
          {sortedTimeline.map((yearData) => (
            <div key={yearData.year}>
              {expandedYears.includes(yearData.year) && (
                <div className="space-y-3 md:space-y-4">
                  {yearData.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`inline-block px-4 py-2 md:px-5 md:py-3 rounded font-bebas font-bold text-xl md:text-2xl lg:text-3xl ${getColorClass(
                        item.color
                      )}`}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
