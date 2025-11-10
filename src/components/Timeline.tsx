import type { TimelineYear, TimelineItemColor } from "@/types/project";

interface TimelineProps {
  timeline: TimelineYear[];
}

const Timeline = ({ timeline }: TimelineProps) => {
  const sortedTimeline = [...timeline].sort((a, b) => parseInt(a.year) - parseInt(b.year));

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
    <div className="relative pt-8 md:pt-10 lg:pt-12 w-full">
      {/* Timeline header with years and connecting line */}
      <div className="relative mb-12 md:mb-16">
        {/* Connecting line behind the squares */}
        <div className="absolute left-0 right-0 h-1 bg-card-foreground" style={{ top: 'calc(2rem + 1.75rem)' }} />
        
        <div className={`grid gap-4 relative`} style={{ gridTemplateColumns: `repeat(${sortedTimeline.length}, 1fr)` }}>
          {sortedTimeline.map((yearData) => (
            <div key={yearData.year} className="flex flex-col items-center">
              <span className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-4">
                {yearData.year}
              </span>
              <div className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-card-foreground relative z-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline items aligned under their respective years */}
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${sortedTimeline.length}, 1fr)` }}>
        {sortedTimeline.map((yearData) => {
          // Sort items: warning first, then others
          const sortedItems = [...yearData.items].sort((a, b) => {
            if (a.color === "warning" && b.color !== "warning") return -1;
            if (a.color !== "warning" && b.color === "warning") return 1;
            return 0;
          });

          return (
            <div key={yearData.year} className="flex flex-col items-start">
              <div className="space-y-3 md:space-y-4 w-full flex flex-col items-start">
                {sortedItems.map((item, idx) => (
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;

