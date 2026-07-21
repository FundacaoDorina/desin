import { Check, Circle, Clock, Pause, X } from "lucide-react";
import type { TimelineYear, TimelineItemColor } from "@/types/project";
import { getTimelineStatusLabel } from "@/lib/a11y";

interface TimelineProps {
  timeline: TimelineYear[];
}

const STATUS_ORDER: TimelineItemColor[] = ["success", "warning", "muted", "suspended", "closed"];

const STATUS_ICON = {
  success: Check,
  warning: Clock,
  muted: Circle,
  suspended: Pause,
  closed: X,
} as const;

const Timeline = ({ timeline }: TimelineProps) => {
  const sortedTimeline = [...timeline].sort((a, b) => parseInt(a.year) - parseInt(b.year));

  const usedStatuses = STATUS_ORDER.filter((status) =>
    sortedTimeline.some((year) => year.items.some((item) => item.color === status))
  );

  const getColorClass = (color: TimelineItemColor) => {
    switch (color) {
      case "success":
        return "bg-success text-success-foreground";
      case "warning":
        return "bg-warning text-warning-foreground";
      case "suspended":
      case "closed":
        return "bg-muted text-muted-foreground";
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

  return (
    <section className="relative pt-8 md:pt-10 lg:pt-12 w-full" aria-labelledby="timeline-heading">
      <h3 id="timeline-heading" className="sr-only">
        Cronograma do projeto
      </h3>

      {usedStatuses.length > 0 && (
        <ul
          className="flex flex-wrap gap-3 md:gap-4 mb-6 md:mb-8 list-none p-0 m-0"
          aria-label="Legenda de andamento dos tickets"
        >
          {usedStatuses.map((status) => {
            const StatusIcon = STATUS_ICON[status];
            return (
              <li
                key={status}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded font-bebas text-sm md:text-base ${getColorClass(status)}`}
              >
                <StatusIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{getTimelineStatusLabel(status)}</span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="relative">
        {sortedTimeline.length > 1 && (
          <div
            className="hidden md:block absolute left-0 right-0 h-1 bg-card-foreground pointer-events-none"
            style={{ top: "calc(2.5rem + 0.5rem)" }}
            aria-hidden="true"
          />
        )}

        <ol
          className="flex flex-col gap-8 md:grid md:gap-4 list-none p-0 m-0"
          style={
            sortedTimeline.length > 0
              ? { gridTemplateColumns: `repeat(${sortedTimeline.length}, minmax(0, 1fr))` }
              : undefined
          }
        >
          {sortedTimeline.map((yearData) => {
            const sortedItems = sortItems(yearData.items);

            return (
              <li key={yearData.year} className="flex flex-col items-center md:items-start min-w-0">
                <div className="flex flex-col items-center mb-4 md:mb-8 w-full">
                  <h4 className="text-card-foreground font-bebas font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-4">
                    {yearData.year}
                  </h4>
                  <div
                    className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-card-foreground relative z-10"
                    aria-hidden="true"
                  />
                </div>

                <ul className="space-y-3 md:space-y-4 w-full flex flex-col items-start list-none p-0 m-0">
                  {sortedItems.map((item, idx) => {
                    const statusLabel = getTimelineStatusLabel(item.color);
                    const StatusIcon = STATUS_ICON[item.color] ?? Circle;

                    return (
                      <li key={`${yearData.year}-${idx}`}>
                        <div
                          className={`inline-flex flex-col items-start gap-1 px-4 py-2 md:px-5 md:py-3 rounded font-bebas font-bold text-xl md:text-2xl lg:text-3xl ${getColorClass(item.color)}`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <StatusIcon className="shrink-0 w-[0.9em] h-[0.9em]" aria-hidden="true" />
                            <span>{item.text}</span>
                          </span>
                          <span className="text-[0.55em] font-normal leading-none opacity-90">
                            {statusLabel}
                          </span>
                        </div>
                      </li>
                    );
                  })}
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
