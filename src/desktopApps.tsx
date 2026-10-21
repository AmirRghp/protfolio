import AboutMeApp, { AboutMeFileIcon } from "./AboutMeApp";
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

/** Every app that lives on the monitor desktop. */
export const desktopApps: DesktopApp[] = [aboutMeApp];
