import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ArcadeMenu from "./ArcadeMenu";
import { portfolioContent } from "./content";
import { desktopApps } from "./desktopApps";
import MonitorDesktop from "./MonitorDesktop";
import RoomUnavailable from "./RoomUnavailable";
import { hotspotHintPosition, type RoomHotspot, type RoomHotspotHover } from "./roomHover";
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
};

const destinationLabels: Record<Exclude<RoomDestination, "room">, string> = {
  monitor: "Monitor",
  arcade: "Arcade",
};

const hotspotLabels: Record<RoomHotspot, string> = {
  monitor: "USE COMPUTER",
  arcade: "USE ARCADE",
};

export default function RoomPreview({ navigation, onNavigate }: RoomPreviewProps) {
  const desktopRef = useRef<HTMLDivElement>(null);
  const arcadeRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const hoveredHotspot = useRef<RoomHotspot | null>(null);
  const returnFocusDestination = useRef<Exclude<RoomDestination, "room"> | null>(null);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [openAppId, setOpenAppId] = useState<string | null>(null);
  const focusedDestination: Exclude<RoomDestination, "room"> | null = navigation.destination === "room"
    ? null
    : navigation.destination;

  const hideHotspotHint = useCallback(() => {
    hoveredHotspot.current = null;
    if (hintRef.current) hintRef.current.dataset.visible = "false";
    if (previewRef.current) delete previewRef.current.dataset.hoveredHotspot;
  }, []);

  const handleHotspotHover = useCallback((hover: RoomHotspotHover | null) => {
    if (!hover) {
      hideHotspotHint();
      return;
    }

    const hint = hintRef.current;
    const next = hover.destination;
    if (hoveredHotspot.current !== next) {
      hoveredHotspot.current = next;
      if (previewRef.current) previewRef.current.dataset.hoveredHotspot = next;
      if (hint) {
        hint.textContent = hotspotLabels[next] ?? "";
        hint.dataset.visible = "true";
      }
    }
    if (!hint) return;

    const bounds = hint.getBoundingClientRect();
    const position = hotspotHintPosition(hover, { width: bounds.width, height: bounds.height }, {
      width: document.documentElement.clientWidth || window.innerWidth,
      height: document.documentElement.clientHeight || window.innerHeight,
    });
    hint.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
  }, [hideHotspotHint]);

  /** Selecting another room destination also discards the monitor window it does not own. */
  const navigate = (destination: RoomDestination) => {
    hideHotspotHint();
    if (destination === "arcade") setOpenAppId(null);
    onNavigate(destination);
  };

  const failScene = () => {
    hideHotspotHint();
    setSceneFailed(true);
    setOpenAppId(null);
  };

  useEffect(() => {
    hideHotspotHint();
  }, [navigation.destination, hideHotspotHint]);

  useEffect(() => {
    const hide = () => hideHotspotHint();
    const onVisibilityChange = () => { if (document.hidden) hide(); };
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      hideHotspotHint();
    };
  }, [hideHotspotHint]);

  const returnToRoom = useCallback((from: Exclude<RoomDestination, "room">) => {
    returnFocusDestination.current = from;
    onNavigate("room");
  }, [onNavigate]);

  // A destination close returns the keyboard to the preview container.
  useEffect(() => {
    if (navigation.destination !== "room") {
      returnFocusDestination.current = null;
      return;
    }
    if (!returnFocusDestination.current) return;
    returnFocusDestination.current = null;
    previewRef.current?.focus({ preventScroll: true });
  }, [navigation.destination]);

  // When a destination is focused, Escape key returns to room.
  useEffect(() => {
    if (!focusedDestination) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        returnToRoom(focusedDestination);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedDestination, returnToRoom]);

  // The desktop is the monitor destination. When the scene is unavailable its hidden layer must
  // not take the focus, so the preview container keeps it instead.
  useEffect(() => {
    if (navigation.destination !== "monitor") return;
    if (sceneFailed) {
      previewRef.current?.focus({ preventScroll: true });
      return;
    }
    desktopRef.current?.focus({ preventScroll: true });
  }, [navigation.destination, sceneFailed]);


  return (
    <section ref={previewRef} className={styles.preview} tabIndex={-1} aria-label="Study room overview">
      {focusedDestination ? (
        <button
          type="button"
          className={styles.backButton}
          onClick={() => returnToRoom(focusedDestination)}
        >
          Go Back (ESC)
        </button>
      ) : (
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <span>AG / {portfolioContent.owner.role}</span>
            <a href="#name">Read portfolio</a>
          </div>
        </header>
      )}
      <div className={styles.scene}>
        <SceneBoundary onFailure={failScene}>
          <Suspense fallback={<p className={styles.message} role="status">Loading study…</p>}>
            <RoomScene
              destination={navigation.destination}
              desktopRef={desktopRef}
              arcadeRef={arcadeRef}
              onUnavailable={failScene}
              onHotspotHover={handleHotspotHover}
              onNavigate={(destination) => {
                navigate(destination);
              }}
            />
          </Suspense>
        </SceneBoundary>
        <div
          className={styles.desktopLayer}
          data-active={navigation.destination === "monitor" && !sceneFailed}
          inert={navigation.destination !== "monitor" || sceneFailed}
        >
          <MonitorDesktop
            ref={desktopRef}
            apps={desktopApps}
            active={navigation.destination === "monitor" && !sceneFailed}
            openAppId={openAppId}
            onOpenAppChange={setOpenAppId}
            onExit={() => returnToRoom("monitor")}
          />
        </div>
        <div
          className={styles.arcadeLayer}
          data-active={navigation.destination === "arcade"}
          data-scene-failed={sceneFailed}
          inert={navigation.destination !== "arcade"}
        >
          <ArcadeMenu
            ref={arcadeRef}
            active={navigation.destination === "arcade"}
            onExit={() => returnToRoom("arcade")}
          />
        </div>
        <div ref={hintRef} className={styles.hotspotHint} data-visible="false" aria-hidden="true" />
      </div>
      <p
        className={styles.caption}
        data-focused={navigation.destination !== "room"}
        aria-live="polite"
      >
        {navigation.destination === "room"
          ? "Study overview · Select the monitor or arcade in the room."
          : `Focused on ${destinationLabels[navigation.destination] ?? navigation.destination}.`}
      </p>
    </section>
  );
}
