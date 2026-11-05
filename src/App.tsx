import { useEffect, useReducer, useState } from "react";
import LanyardIntro from "./LanyardIntro";
import OwnerContent from "./OwnerContent";
import RoomPreview from "./RoomPreview";
import { portfolioContent } from "./content";
import { shouldSkipLanyardIntro } from "./lanyardPull";
import { initialRoomNavigation, roomNavigationReducer, type RoomDestination, type RoomNavigationState } from "./roomNavigation";

function getInitialNavigation(): RoomNavigationState {
  if (typeof window !== "undefined") {
    const param = new URLSearchParams(window.location.search).get("destination") as RoomDestination | null;
    if (param === "monitor" || param === "arcade") {
      return { destination: param };
    }
  }
  return initialRoomNavigation;
}

function getInitialIntroPhase(): "active" | "revealing" | "ready" {
  if (typeof window !== "undefined" && shouldSkipLanyardIntro(window.location.search)) {
    return "ready";
  }
  return "active";
}

export default function App() {
  const [navigation, dispatch] = useReducer(roomNavigationReducer, undefined, getInitialNavigation);
  const [introPhase, setIntroPhase] = useState<"active" | "revealing" | "ready">(getInitialIntroPhase);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (introPhase === "active") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [introPhase]);

  return (
    <>
      {introPhase !== "ready" && (
        <LanyardIntro
          onEnter={() => setIntroPhase("revealing")}
          onDismissed={() => setIntroPhase("ready")}
        />
      )}
      <div className="site-shell" data-intro-phase={introPhase}>
        <RoomPreview
          navigation={navigation}
          onNavigate={(destination) => dispatch({ type: "navigate", destination })}
        />
        <main className="intro" aria-labelledby="name">
          <OwnerContent />
          <section className="projects" aria-labelledby="projects-heading">
            <h2 id="projects-heading">Selected projects</h2>
            <ul>
              {portfolioContent.projects.map((project) => (
                <li className="project" key={project.id}>
                  <h3>{project.title}</h3>
                  <p>{project.brief}</p>
                  <a href={project.githubUrl} aria-label={`View ${project.title} on GitHub`}>
                    View on GitHub
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </>
  );
}

