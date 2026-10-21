import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { portfolioContent } from "./content";
import MonitorDesktop from "./MonitorDesktop";
import ProjectBoard from "./ProjectBoard";
import RoomUnavailable from "./RoomUnavailable";
import styles from "./RoomPreview.module.css";
import type { RoomDestination, RoomNavigationState } from "./roomNavigation";

const RoomScene = lazy(() => import("./RoomScene"));

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? <RoomUnavailable /> : this.props.children;
  }
}

type RoomPreviewProps = {
  navigation: RoomNavigationState;
  onNavigate: (destination: RoomDestination) => void;
  onSelectProject: (projectId: string | null) => void;
};

const destinations: { id: Exclude<RoomDestination, "room">; label: string }[] = [
  { id: "monitor", label: "Monitor" },
  { id: "board", label: "Project board" },
  { id: "arcade", label: "Arcade" },
];

function ArcadePanel() {
  const [playing, setPlaying] = useState(false);
  const playButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!playing) playButton.current?.focus();
  }, [playing]);

  return (
    <section className={styles.arcade} aria-label="Crash Bandicoot arcade screen">
      <div className={styles.arcadeScreen}>
        {playing ? (
          <div className={styles.arcadeViewport}>
            <iframe
              title="Crash Bandicoot on PS1FUN"
              src="https://www.ps1fun.com/play/crash-bandicoot/1212"
              scrolling="no"
              allow="fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <div className={styles.arcadePrompt}>
            <h2>Crash Bandicoot</h2>
            <button ref={playButton} type="button" onClick={() => setPlaying(true)}>Play game</button>
            <p>Hosted by PS1FUN. The game loads after you choose to play.</p>
          </div>
        )}
      </div>
      <div className={styles.arcadeControls}>
        {playing && <button type="button" onClick={() => setPlaying(false)}>Exit game</button>}
        <a href="https://www.ps1fun.com/play/crash-bandicoot/1212" target="_blank" rel="noreferrer">
          Open game on PS1FUN
        </a>
      </div>
    </section>
  );
}

export default function RoomPreview({ navigation, onNavigate, onSelectProject }: RoomPreviewProps) {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [sceneFailed, setSceneFailed] = useState(false);

  useEffect(() => {
    if (navigation.destination === "monitor") desktopRef.current?.focus({ preventScroll: true });
  }, [navigation.destination]);

  const exitMonitor = () => {
    document.getElementById("destination-monitor")?.focus({ preventScroll: true });
    onNavigate("room");
  };

  return (
    <section className={styles.preview} aria-label="Study room overview">
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span>AG / {portfolioContent.owner.role}</span>
          <a href="#name">Read portfolio</a>
        </div>
        <nav className={styles.destinations} aria-label="Study destinations">
          {destinations.map(({ id, label }) => (
            <button id={`destination-${id}`} key={id} type="button" aria-pressed={navigation.destination === id} onClick={() => onNavigate(id)}>
              {label}
            </button>
          ))}
          {navigation.destination !== "room" && (
            <button type="button" className={styles.back} onClick={() => {
              document.getElementById(`destination-${navigation.destination}`)?.focus({ preventScroll: true });
              onNavigate("room");
            }}>
              Back to room
            </button>
          )}
        </nav>
      </div>
      <div className={styles.scene}>
        <SceneBoundary onFailure={() => setSceneFailed(true)}>
          <Suspense fallback={<p className={styles.message} role="status">Loading study…</p>}>
            <RoomScene destination={navigation.destination} desktopRef={desktopRef} onNavigate={(destination) => {
              if (destination === "monitor" || destination === "board") {
                document.getElementById(`destination-${destination}`)?.focus({ preventScroll: true });
              }
              onNavigate(destination);
            }} />
          </Suspense>
        </SceneBoundary>
        {navigation.destination === "arcade" && <ArcadePanel />}
        <div
          className={styles.desktopLayer}
          data-active={navigation.destination === "monitor" && !sceneFailed}
          inert={navigation.destination !== "monitor" || sceneFailed}
        >
          <MonitorDesktop ref={desktopRef} active={navigation.destination === "monitor" && !sceneFailed} onExit={exitMonitor} />
        </div>
      </div>
      {navigation.destination === "board" && <ProjectBoard
        projects={portfolioContent.projects}
        selectedProjectId={navigation.selectedProjectId}
        onSelectProject={onSelectProject}
        onClose={() => onNavigate("room")}
      />}
      <p className={styles.caption} aria-live="polite">
        {navigation.destination === "room"
          ? "Study overview · Choose a destination above or select the monitor, project board, or arcade in the room."
          : `Focused on ${destinations.find(({ id }) => id === navigation.destination)?.label}.`}
      </p>
    </section>
  );
}
