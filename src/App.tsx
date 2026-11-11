import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { LanyardIntro, getInitialIntroPhaseFromSearch, type IntroPhase } from "@/features/lanyard";
import { RoomPreview, roomNavigationReducer, initialRoomNavigation, oiiaAudio, type RoomDestination, type RoomNavigationState } from "@/features/room";
import { FlatLanding } from "@/features/landing";
import { EXIT_SHUTTER_DURATION_MS, MagicCursor, useResponsiveDevice } from "@/core";

function getInitialNavigation(): RoomNavigationState {
  if (typeof window !== "undefined") {
    const param = new URLSearchParams(window.location.search).get("destination") as RoomDestination | null;
    if (param === "monitor" || param === "arcade") {
      return { destination: param };
    }
  }
  return initialRoomNavigation;
}

function getInitialIntroPhase(): IntroPhase {
  if (typeof window !== "undefined") {
    if (window.location.hash === "#portfolio") {
      return "ready";
    }
    return getInitialIntroPhaseFromSearch(
      window.location.search,
      Boolean(navigator.webdriver),
    );
  }
  return "active";
}

function getInitialViewMode(): "room" | "flat" {
  if (typeof window !== "undefined" && window.location.hash === "#portfolio") {
    return "flat";
  }
  return "room";
}

export default function App() {
  const device = useResponsiveDevice();
  const [navigation, dispatch] = useReducer(roomNavigationReducer, undefined, getInitialNavigation);
  const [introPhase, setIntroPhase] = useState<IntroPhase>(getInitialIntroPhase);
  const [lanyardDismissed, setLanyardDismissed] = useState<boolean>(
    () => getInitialIntroPhase() !== "active",
  );
  const [viewMode, setViewMode] = useState<"room" | "flat">(getInitialViewMode);
  const [isReentering, setIsReentering] = useState(false);
  const reenterTimerRef = useRef<number | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // When 3D room is not allowed (mobile/tablet/touch), force viewMode to "flat"
  const activeViewMode = device.allowRoom3D ? viewMode : "flat";

  useEffect(() => {
    return () => {
      if (reenterTimerRef.current !== null) {
        window.clearTimeout(reenterTimerRef.current);
      }
    };
  }, []);

  // If URL has #room on a device without 3D room support, redirect immediately to #portfolio
  useEffect(() => {
    if (!device.allowRoom3D && typeof window !== "undefined" && window.location.hash === "#room") {
      try {
        window.history.replaceState(null, "", "#portfolio");
      } catch {
        // Safe fallback
      }
    }
  }, [device.allowRoom3D]);

  const handleLanyardEnter = useCallback(() => {
    if (!device.allowRoom3D) {
      setIntroPhase("ready");
      return;
    }
    setIntroPhase((prev) => (prev === "active" ? "building" : prev));
  }, [device.allowRoom3D]);

  const handleLanyardDismissed = useCallback(() => {
    setLanyardDismissed(true);
    if (!device.allowRoom3D) {
      setIntroPhase("ready");
    }
  }, [device.allowRoom3D]);

  const handleBuildComplete = useCallback(() => {
    setIntroPhase("ready");
  }, []);

  const handleExitToFlat = useCallback(() => {
    if (reenterTimerRef.current !== null) {
      window.clearTimeout(reenterTimerRef.current);
      reenterTimerRef.current = null;
    }
    setIsReentering(false);
    oiiaAudio.reset();
    setViewMode("flat");
    if (typeof window !== "undefined") {
      try {
        window.history.pushState(null, "", "#portfolio");
      } catch {
        // Safe fallback in restricted environments
      }
    }
  }, []);

  const triggerReenterRoom = useCallback(
    (updateHistory: boolean) => {
      if (!device.allowRoom3D || isReentering) return;
      setLanyardDismissed(true);
      setIntroPhase("ready");
      dispatch({ type: "navigate", destination: "room" });

      if (updateHistory && typeof window !== "undefined") {
        try {
          window.history.pushState(null, "", "#room");
        } catch {
          // Safe fallback
        }
      }

      const reducedMotion =
        typeof window !== "undefined" &&
        (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

      if (reducedMotion || typeof window === "undefined") {
        setIsReentering(false);
        setViewMode("room");
        return;
      }

      setIsReentering(true);
      if (reenterTimerRef.current !== null) {
        window.clearTimeout(reenterTimerRef.current);
      }
      reenterTimerRef.current = window.setTimeout(() => {
        reenterTimerRef.current = null;
        setViewMode("room");
        setIsReentering(false);
      }, EXIT_SHUTTER_DURATION_MS);
    },
    [device.allowRoom3D, isReentering],
  );

  const handleReenterRoom = useCallback(() => {
    triggerReenterRoom(true);
  }, [triggerReenterRoom]);

  useEffect(() => {
    const handleHashChange = () => {
      if (!device.allowRoom3D) {
        setViewMode("flat");
        if (typeof window !== "undefined" && window.location.hash === "#room") {
          try {
            window.history.replaceState(null, "", "#portfolio");
          } catch {
            // Safe fallback
          }
        }
        return;
      }
      if (window.location.hash === "#portfolio") {
        if (reenterTimerRef.current !== null) {
          window.clearTimeout(reenterTimerRef.current);
          reenterTimerRef.current = null;
        }
        setIsReentering(false);
        setViewMode("flat");
      } else if (window.location.hash === "#room" || window.location.hash === "") {
        if (viewMode === "flat" && !isReentering) {
          triggerReenterRoom(false);
        } else if (!isReentering) {
          setViewMode("room");
        }
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [device.allowRoom3D, viewMode, isReentering, triggerReenterRoom]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.classList.toggle("away", activeViewMode === "flat" && !isReentering);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove("away");
      document.body.style.overflow = "";
    };
  }, [activeViewMode, isReentering]);

  const handleRoomNavigate = useCallback((destination: RoomDestination) => {
    dispatch({ type: "navigate", destination });
  }, []);

  const showMagicCursor = !device.isTouch && !device.isMobileOrTablet;

  return (
    <>
      {!lanyardDismissed && (
        <LanyardIntro
          onEnter={handleLanyardEnter}
          onDismissed={handleLanyardDismissed}
        />
      )}
      {showMagicCursor && <MagicCursor />}
      <div className="site-shell" data-intro-phase={introPhase} data-view-mode={activeViewMode}>
        {device.allowRoom3D && (
          <div
            ref={previewContainerRef}
            aria-hidden={activeViewMode === "flat"}
            style={{
              position: "relative",
              zIndex: activeViewMode === "room" || isReentering ? 50 : 1,
              pointerEvents: activeViewMode === "flat" ? "none" : "auto",
              userSelect: activeViewMode === "flat" ? "none" : "auto",
            }}
          >
            <RoomPreview
              navigation={navigation}
              onNavigate={handleRoomNavigate}
              introPhase={introPhase}
              onBuildComplete={handleBuildComplete}
              onExitToFlat={handleExitToFlat}
              isAway={activeViewMode === "flat" && !isReentering}
              isReentering={isReentering}
            />
          </div>
        )}
        <FlatLanding
          isOpen={activeViewMode === "flat"}
          onReenter={handleReenterRoom}
          allowRoomEntry={device.allowRoom3D}
          isIntroDismissed={lanyardDismissed || introPhase !== "active"}
          isReentering={isReentering}
        />
      </div>
    </>
  );
}

