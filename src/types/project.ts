export type TimelineItemColor = "success" | "warning" | "muted";

export interface TimelineItem {
  text: string;
  color: TimelineItemColor;
}

export interface TimelineYear {
  year: string;
  items: TimelineItem[];
}

export interface Project {
  id: string;
  name: string;
  status: string;
  nextStep: string;
  timeline: TimelineYear[];
}
