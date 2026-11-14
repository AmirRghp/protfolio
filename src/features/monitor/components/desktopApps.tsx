import {
  AboutMeApp,
  AboutMeFileIcon,
  AgentGlyph,
  ChatGlyph,
  KanbanGlyph,
  KycGlyph,
  LayersGlyph,
  ProjectApp,
  RagGlyph,
  ScanGlyph,
  VisionGlyph,
} from "@/features/monitor/apps";
import { portfolioContent, type ProjectIcon } from "@/data/content";
import type { DesktopApp } from "./MonitorDesktop";

/** The `about-me.txt` file of the monitor desktop. */
export const aboutMeApp: DesktopApp = {
  id: "about-me",
  label: "about-me.txt",
  title: "about-me.txt",
  icon: <AboutMeFileIcon />,
  content: <AboutMeApp />,
  activation: "double-click",
};

const projectGlyphs: Record<ProjectIcon, () => React.ReactElement> = {
  scan: ScanGlyph,
  rag: RagGlyph,
  vision: VisionGlyph,
  agent: AgentGlyph,
  chat: ChatGlyph,
  layers: LayersGlyph,
  kyc: KycGlyph,
  kanban: KanbanGlyph,
};

/** Every project of the shared content becomes an app of the monitor desktop. */
export const projectApps: DesktopApp[] = portfolioContent.projects.map((project) => {
  const Glyph = projectGlyphs[project.icon];
  const icon = <Glyph />;
  return {
    id: project.id,
    label: project.title,
    title: project.title,
    icon,
    content: <ProjectApp project={project} icon={icon} />,
    activation: "double-click",
  };
});

/** Every app that lives on the monitor desktop. */
export const desktopApps: DesktopApp[] = [aboutMeApp, ...projectApps];
