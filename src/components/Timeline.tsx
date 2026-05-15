import type { TimelineYear, TimelineItemColor } from "@/types/project";
import { getTimelineStatusLabel } from "@/lib/a11y";

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

  const sortItems = (items: TimelineYear["items"]) =>
    [...items].sort((a, b) => {
      if (a.color === "warning" && b.color !== "warning") return -1;
      if (a.color !== "warning" && b.color === "warning") return 1;
      return 0;
    });

  const renderTimelineItem = (item: TimelineYear["items"][number], idx: number, sizeClass: string) => (
    <li
      key={idx}
      className={`inline-block px-4 py-2 rounded font-bebas font-bold ${sizeClass} ${getColorClass(item.color)}`}
    >
      <span className="sr-only">{getTimelineStatusLabel(item.color)}: </span>
      {item.text}
    </li>
  );

  return (
    <section className="relative pt-8 md:pt-10 lg:pt-12 w-full" aria-labelledby="timeline-heading">
      <h3 id="timeline-heading" className="sr-only">
        Cronograma do projeto
      </h3>

      <ol className="flex flex-col md:hidden gap-8 list-none p-0 m-0">
        {sortedTimeline.map((yearData) => {
          const sortedItems = sortItems(yearData.items);

          return (
            <li key={yearData.year} className="flex flex-col">
              <div className="flex flex-col items-center mb-4">
                <h4 className="text-card-foreground font-bebas font-bold text-2xl mb-4">
                  {yearData.year}
                </h4>
                <div className="w-6 h-6 bg-card-foreground" aria-hidden="true" />
              </div>
              <ul className="space-y-3 w-full flex flex-col items-start mt-4 list-none p-0 m-0">
                {sortedItems.map((item, idx) => renderTimelineItem(item, idx, "text-xl"))}
              </ul>
            </li>
          );
        })}
      </ol>

      <div className="hidden md:block">
        <div className="relative mb-12 md:mb-16">
          <div
            className="absolute left-0 right-0 h-1 bg-card-foreground"
            style={{ top: "calc(2rem + 1.75rem)" }}
            aria-hidden="true"
          />

          <ol
            className="grid gap-4 relative list-none p-0 m-0"
            style={{ gridTemplateColumns: `repeat(${sortedTimeline.length}, 1fr)` }}
          >
            {sortedTimeline.map((yearData) => (
              <li key={yearData.year} className="flex flex-col items-center">
                <h4 className="text-card-foreground font-bebas font-bold text-3xl lg:text-4xl xl:text-5xl mb-4">
                  {yearData.year}
                </h4>
                <div className="w-8 lg:w-10 lg:h-10 bg-card-foreground relative z-10" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>

        <ol
          className="grid gap-4 list-none p-0 m-0"
          style={{ gridTemplateColumns: `repeat(${sortedTimeline.length}, 1fr)` }}
        >
          {sortedTimeline.map((yearData) => {
            const sortedItems = sortItems(yearData.items);

            return (
              <li key={yearData.year} className="flex flex-col items-start">
                <ul className="space-y-3 md:space-y-4 w-full flex flex-col items-start list-none p-0 m-0">
                  {sortedItems.map((item, idx) =>
                    renderTimelineItem(item, idx, "text-2xl lg:text-3xl px-5 md:py-3")
                  )}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default Timeline;
