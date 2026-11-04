import { useReducer } from "react";
import OwnerContent from "./OwnerContent";
import RoomPreview from "./RoomPreview";
import { portfolioContent } from "./content";
import { initialRoomNavigation, roomNavigationReducer, type RoomDestination, type RoomNavigationState } from "./roomNavigation";

function getInitialNavigation(): RoomNavigationState {
  if (typeof window !== "undefined") {
    const param = new URLSearchParams(window.location.search).get("destination") as RoomDestination | null;
    if (param === "board" || param === "monitor" || param === "arcade") {
      return { destination: param, selectedProjectId: null };
    }
  }
  return initialRoomNavigation;
}

export default function App() {
  const [navigation, dispatch] = useReducer(roomNavigationReducer, undefined, getInitialNavigation);

  return (
    <>
      <RoomPreview
        navigation={navigation}
        onNavigate={(destination) => dispatch({ type: "navigate", destination })}
        onSelectProject={(projectId) => dispatch({ type: "select-project", projectId })}
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
    </>
  );
}
