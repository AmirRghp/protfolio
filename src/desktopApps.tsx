import AboutMeApp, { AboutMeFileIcon } from "./AboutMeApp";
import { portfolioContent, type ProjectIcon } from "./content";
import type { DesktopApp } from "./MonitorDesktop";
import ProjectApp, { ChatGlyph, LayersGlyph, RadarGlyph } from "./ProjectApp";

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
  chat: ChatGlyph,
  layers: LayersGlyph,
  radar: RadarGlyph,
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
  };
});

/** Every app that lives on the monitor desktop. */
export const desktopApps: DesktopApp[] = [aboutMeApp, ...projectApps];
