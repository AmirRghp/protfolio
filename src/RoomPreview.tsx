import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { portfolioContent } from "./content";
import { desktopApps } from "./desktopApps";
import MonitorDesktop from "./MonitorDesktop";
import ProjectBoard from "./ProjectBoard";
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
  onSelectProject: (projectId: string | null) => void;
};

const destinations: { id: Exclude<RoomDestination, "room">; label: string }[] = [
  { id: "monitor", label: "Monitor" },
  { id: "board", label: "Project board" },
  { id: "arcade", label: "Arcade" },
];

const ARCADE_GAME_URL = "https://www.ps1fun.com/play/crash-bandicoot/1212";

/** How long the third-party game may take before the arcade reports that it cannot be shown. */
const ARCADE_LOAD_TIMEOUT_MS = 8000;

function ArcadePanel() {
  const [playing, setPlaying] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const playButton = useRef<HTMLButtonElement>(null);
  const exitButton = useRef<HTMLButtonElement>(null);
  const loadTimeout = useRef<number | null>(null);

  const clearLoadTimeout = () => {
    if (loadTimeout.current !== null) {
      window.clearTimeout(loadTimeout.current);
      loadTimeout.current = null;
    }
  };

  useEffect(() => () => {
    if (loadTimeout.current !== null) window.clearTimeout(loadTimeout.current);
  }, []);

  useEffect(() => {
    const target = playing ? exitButton.current : playButton.current;
    target?.focus({ preventScroll: true });
  }, [playing]);

  const startGame = () => {
    clearLoadTimeout();
    setLoadTimedOut(false);
    setPlaying(true);
    loadTimeout.current = window.setTimeout(() => {
      loadTimeout.current = null;
      setLoadTimedOut(true);
    }, ARCADE_LOAD_TIMEOUT_MS);
  };

  // A cross-origin load event can belong to the browser's error page, so it only stops the
  // no-load timer. It is not evidence that the game rendered, and the outside guidance stays up.
  const handleFrameLoad = () => {
    clearLoadTimeout();
  };

  const exitGame = () => {
    clearLoadTimeout();
    setLoadTimedOut(false);
    setPlaying(false);
  };

  return (
    <section className={styles.arcade} aria-label="Crash Bandicoot arcade screen">
      <div className={styles.arcadeScreen}>
        {playing ? (
          loadTimedOut ? (
            <div className={styles.arcadePrompt}>
              <h2>Crash Bandicoot</h2>
              <p role="status">
                The game did not appear in the arcade within 8 seconds. Open it directly on PS1FUN with the link below.
              </p>
            </div>
          ) : (
            <div className={styles.arcadeViewport}>
              <iframe
                title="Crash Bandicoot on PS1FUN"
                src={ARCADE_GAME_URL}
                scrolling="no"
                allow="fullscreen"
                allowFullScreen
                referrerPolicy="no-referrer"
                aria-describedby="arcade-embed-hint"
                onLoad={handleFrameLoad}
              />
            </div>
          )
        ) : (
          <div className={styles.arcadePrompt}>
            <h2>Crash Bandicoot</h2>
            <button ref={playButton} type="button" onClick={startGame}>Play game</button>
            <p>Hosted by PS1FUN. The game loads after you choose to play.</p>
          </div>
        )}
      </div>
      <div className={styles.arcadeControls}>
        {playing && <button ref={exitButton} type="button" onClick={exitGame}>Exit game</button>}
        <a href={ARCADE_GAME_URL} target="_blank" rel="noopener noreferrer">
          Open game on PS1FUN
        </a>
        {playing && !loadTimedOut && (
          <p id="arcade-embed-hint" className={styles.arcadeHint}>
            If the game does not appear, open it directly on PS1FUN.
          </p>
        )}
      </div>
    </section>
  );
}

export default function RoomPreview({ navigation, onNavigate, onSelectProject }: RoomPreviewProps) {
  const desktopRef = useRef<HTMLDivElement>(null);
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
      if (hint) hint.dataset.visible = next === "monitor" ? "true" : "false";
    }
    if (next !== "monitor" || !hint) return;

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
    if (destination === "board" || destination === "arcade") setOpenAppId(null);
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

  // A destination close returns focus to the room overview.
  useEffect(() => {
    if (navigation.destination !== "room") {
      returnFocusDestination.current = null;
      return;
    }
    const destination = returnFocusDestination.current;
    if (!destination) return;
    returnFocusDestination.current = null;
    previewRef.current?.focus({ preventScroll: true });
  }, [navigation.destination]);

  // When a destination is focused, Escape key returns to room (if not handled by dialog like board).
  useEffect(() => {
    if (!focusedDestination || focusedDestination === "board") return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        returnToRoom(focusedDestination);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedDestination]);

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

  const returnToRoom = (from: Exclude<RoomDestination, "room">) => {
    returnFocusDestination.current = from;
    onNavigate("room");
  };

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
              onUnavailable={failScene}
              onHotspotHover={handleHotspotHover}
              onNavigate={(destination) => {
                navigate(destination);
              }}
            />
          </Suspense>
        </SceneBoundary>
        {navigation.destination === "arcade" && <ArcadePanel />}
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
        <div ref={hintRef} className={styles.hotspotHint} data-visible="false" aria-hidden="true">
          USE COMPUTER
        </div>
      </div>
      {navigation.destination === "board" && <ProjectBoard
        projects={portfolioContent.projects}
        selectedProjectId={navigation.selectedProjectId}
        onSelectProject={onSelectProject}
        onClose={() => returnToRoom("board")}
      />}
      <p
        className={styles.caption}
        data-focused={navigation.destination !== "room"}
        aria-live="polite"
      >
        {navigation.destination === "room"
          ? "Study overview · Select the monitor, project board, or arcade in the room."
          : `Focused on ${destinations.find(({ id }) => id === navigation.destination)?.label ?? navigation.destination}.`}
      </p>
    </section>
  );
}
