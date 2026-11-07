import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ArcadeMenu from "./ArcadeMenu";
import { portfolioContent } from "./content";
import { desktopApps } from "./desktopApps";
import MonitorDesktop from "./MonitorDesktop";
import RoomUnavailable from "./RoomUnavailable";
import {
  backCursorHintPosition,
  hotspotHintPosition,
  ROOM_HOTSPOT_LABELS,
  type RoomHotspot,
  type RoomHotspotHover,
} from "./roomHover";
import styles from "./RoomPreview.module.css";
import type { RoomDestination, RoomNavigationState } from "./roomNavigation";
import { oiiaAudio } from "./oiiaAudio";

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

const hotspotLabels = ROOM_HOTSPOT_LABELS;

export default function RoomPreview({ navigation, onNavigate }: RoomPreviewProps) {
  const desktopRef = useRef<HTMLDivElement>(null);
  const arcadeRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const backHintRef = useRef<HTMLDivElement>(null);
  const layerPointerDownTarget = useRef<EventTarget | null>(null);
  const hoveredHotspot = useRef<RoomHotspot | null>(null);
  const returnFocusDestination = useRef<Exclude<RoomDestination, "room"> | null>(null);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [outsideHover, setOutsideHover] = useState(false);
  const [prevDestination, setPrevDestination] = useState(navigation.destination);
  if (prevDestination !== navigation.destination) {
    setPrevDestination(navigation.destination);
    if (outsideHover) {
      setOutsideHover(false);
    }
  }
  const [openAppId, setOpenAppId] = useState<string | null>(null);
  useEffect(() => {
    if (navigation.destination !== "room") {
      oiiaAudio.reset();
    }
  }, [navigation.destination]);
  const focusedDestination: Exclude<RoomDestination, "room"> | null = navigation.destination === "room"
    ? null
    : navigation.destination;

  const hideHotspotHint = useCallback(() => {
    hoveredHotspot.current = null;
    if (hintRef.current) hintRef.current.dataset.visible = "false";
    if (previewRef.current) delete previewRef.current.dataset.hoveredHotspot;
  }, []);

  const hideBackHint = useCallback(() => {
    if (backHintRef.current) backHintRef.current.dataset.visible = "false";
    setOutsideHover(false);
  }, []);

  const updateBackHint = useCallback((clientX: number, clientY: number) => {
    const hint = backHintRef.current;
    if (!hint) return;
    const bounds = hint.getBoundingClientRect();
    const position = backCursorHintPosition(
      { clientX, clientY },
      { width: bounds.width || 76, height: bounds.height || 24 },
      {
        width: document.documentElement.clientWidth || window.innerWidth,
        height: document.documentElement.clientHeight || window.innerHeight,
      },
    );
    hint.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
    if (hint.dataset.visible !== "true") hint.dataset.visible = "true";
  }, []);

  const handleLayerPointerMove = useCallback((event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    if (event.target === event.currentTarget) {
      setOutsideHover(true);
      updateBackHint(event.clientX, event.clientY);
    } else {
      hideBackHint();
    }
  }, [updateBackHint, hideBackHint]);

  const handleLayerPointerDown = useCallback((event: React.PointerEvent) => {
    layerPointerDownTarget.current = event.target;
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
    hideBackHint();
    if (destination === "arcade") setOpenAppId(null);
    onNavigate(destination);
  };

  const failScene = () => {
    hideHotspotHint();
    hideBackHint();
    setSceneFailed(true);
    setOpenAppId(null);
  };

  useEffect(() => {
    hideHotspotHint();
    if (backHintRef.current) backHintRef.current.dataset.visible = "false";
  }, [navigation.destination, hideHotspotHint]);

  useEffect(() => {
    const hide = () => {
      hideHotspotHint();
      hideBackHint();
    };
    const onVisibilityChange = () => { if (document.hidden) hide(); };
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      hide();
    };
  }, [hideHotspotHint, hideBackHint]);

  const returnToRoom = useCallback((from: Exclude<RoomDestination, "room">) => {
    hideBackHint();
    returnFocusDestination.current = from;
    onNavigate("room");
  }, [hideBackHint, onNavigate]);

  const handleLayerClick = useCallback((event: React.MouseEvent, destination: Exclude<RoomDestination, "room">) => {
    if (event.button === 0 && event.target === event.currentTarget && layerPointerDownTarget.current === event.currentTarget) {
      returnToRoom(destination);
    }
  }, [returnToRoom]);

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

  // When in room overview, 1/M focuses Monitor and 2/A focuses Arcade; when focused, Escape returns to room.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (focusedDestination) {
        if (event.key === "Escape") {
          returnToRoom(focusedDestination);
        }
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "1" || event.key === "m" || event.key === "M") {
        event.preventDefault();
        hideHotspotHint();
        hideBackHint();
        onNavigate("monitor");
      } else if (event.key === "2" || event.key === "a" || event.key === "A") {
        event.preventDefault();
        hideHotspotHint();
        hideBackHint();
        setOpenAppId(null);
        onNavigate("arcade");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedDestination, returnToRoom, hideHotspotHint, hideBackHint, onNavigate]);

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
          data-outside-hover={outsideHover && navigation.destination === "monitor" && !sceneFailed}
          inert={navigation.destination !== "monitor" || sceneFailed}
          onPointerMove={handleLayerPointerMove}
          onPointerLeave={hideBackHint}
          onPointerDown={handleLayerPointerDown}
          onClick={(event) => handleLayerClick(event, "monitor")}
        >
          <MonitorDesktop
            ref={desktopRef}
            apps={desktopApps}
            active={navigation.destination === "monitor" && !sceneFailed}
            outsideHover={outsideHover && navigation.destination === "monitor" && !sceneFailed}
            openAppId={openAppId}
            onOpenAppChange={setOpenAppId}
            onExit={() => returnToRoom("monitor")}
          />
        </div>
        <div
          className={styles.arcadeLayer}
          data-active={navigation.destination === "arcade"}
          data-outside-hover={outsideHover && navigation.destination === "arcade"}
          data-scene-failed={sceneFailed}
          inert={navigation.destination !== "arcade"}
          onPointerMove={handleLayerPointerMove}
          onPointerLeave={hideBackHint}
          onPointerDown={handleLayerPointerDown}
          onClick={(event) => handleLayerClick(event, "arcade")}
        >
          <ArcadeMenu
            ref={arcadeRef}
            active={navigation.destination === "arcade"}
            outsideHover={outsideHover && navigation.destination === "arcade"}
            onExit={() => returnToRoom("arcade")}
          />
        </div>
        <div ref={hintRef} className={styles.hotspotHint} data-visible="false" aria-hidden="true" />
        <div ref={backHintRef} className={styles.backCursorHint} data-visible="false" aria-hidden="true">
          [Go Back]
        </div>
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
