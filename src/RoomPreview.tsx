import { Component, lazy, Suspense, type ReactNode } from "react";
import { portfolioContent } from "./content";
import RoomUnavailable from "./RoomUnavailable";
import styles from "./RoomPreview.module.css";
import type { RoomDestination, RoomNavigationState } from "./roomNavigation";

const RoomScene = lazy(() => import("./RoomScene"));

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <RoomUnavailable /> : this.props.children;
  }
}

type RoomPreviewProps = {
  navigation: RoomNavigationState;
  onNavigate: (destination: RoomDestination) => void;
};

const destinations: { id: Exclude<RoomDestination, "room">; label: string }[] = [
  { id: "monitor", label: "Monitor" },
  { id: "board", label: "Project board" },
  { id: "arcade", label: "Arcade" },
];

export default function RoomPreview({ navigation, onNavigate }: RoomPreviewProps) {
  return (
    <section className={styles.preview} aria-label="Study room overview">
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span>AG / {portfolioContent.owner.role}</span>
          <a href="#name">Read portfolio</a>
        </div>
        <nav className={styles.destinations} aria-label="Study destinations">
          {destinations.map(({ id, label }) => (
            <button key={id} type="button" aria-pressed={navigation.destination === id} onClick={() => onNavigate(id)}>
              {label}
            </button>
          ))}
          {navigation.destination !== "room" && (
            <button type="button" className={styles.back} onClick={() => onNavigate("room")}>
              Back to room
            </button>
          )}
        </nav>
      </div>
      <div className={styles.scene}>
        <SceneBoundary>
          <Suspense fallback={<p className={styles.message} role="status">Loading study…</p>}>
            <RoomScene destination={navigation.destination} onNavigate={onNavigate} />
          </Suspense>
        </SceneBoundary>
      </div>
      <p className={styles.caption} aria-live="polite">
        {navigation.destination === "room"
          ? "Study overview · Choose a destination above or select the monitor, project board, or arcade in the room."
          : `Focused on ${destinations.find(({ id }) => id === navigation.destination)?.label}.`}
      </p>
    </section>
  );
}
