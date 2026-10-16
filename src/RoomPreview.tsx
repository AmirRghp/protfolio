import { Component, lazy, Suspense, type ReactNode } from "react";
import { portfolioContent } from "./content";
import RoomUnavailable from "./RoomUnavailable";
import styles from "./RoomPreview.module.css";

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

export default function RoomPreview() {
  return (
    <section className={styles.preview} aria-label="Study room overview">
      <div className={styles.header}>
        <span>AG / {portfolioContent.owner.role}</span>
        <a href="#name">Read portfolio</a>
      </div>
      <div className={styles.scene}>
        <SceneBoundary>
          <Suspense fallback={<p className={styles.message} role="status">Loading study…</p>}>
            <RoomScene />
          </Suspense>
        </SceneBoundary>
      </div>
      <p className={styles.caption}>Study overview · Projects on the left, workstation in the center, arcade on the right.</p>
    </section>
  );
}
