import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { LanyardIntro, getInitialIntroPhaseFromSearch, type IntroPhase } from "@/features/lanyard";
import { RoomPreview, roomNavigationReducer, initialRoomNavigation, oiiaAudio, type RoomDestination, type RoomNavigationState } from "@/features/room";
import { FlatLanding } from "@/features/landing";
import { MagicCursor, useResponsiveDevice } from "@/core";

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
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // When 3D room is not allowed (mobile/tablet/touch), force viewMode to "flat"
  const activeViewMode = device.allowRoom3D ? viewMode : "flat";

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

  const handleReenterRoom = useCallback(() => {
    if (!device.allowRoom3D) return;
    setViewMode("room");
    if (typeof window !== "undefined") {
      try {
        window.history.pushState(null, "", "#room");
      } catch {
        // Safe fallback
      }
    }
  }, [device.allowRoom3D]);

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
        setViewMode("flat");
      } else if (window.location.hash === "#room" || window.location.hash === "") {
        setViewMode("room");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [device.allowRoom3D]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.classList.toggle("away", activeViewMode === "flat");
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove("away");
      document.body.style.overflow = "";
    };
  }, [activeViewMode]);

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
              pointerEvents: activeViewMode === "flat" ? "none" : "auto",
              userSelect: activeViewMode === "flat" ? "none" : "auto",
            }}
          >
            <RoomPreview
              navigation={navigation}
              onNavigate={(destination) => dispatch({ type: "navigate", destination })}
              introPhase={introPhase}
              onBuildComplete={handleBuildComplete}
              onExitToFlat={handleExitToFlat}
            />
          </div>
        )}
        <FlatLanding
          isOpen={activeViewMode === "flat"}
          onReenter={handleReenterRoom}
          allowRoomEntry={device.allowRoom3D}
          isIntroDismissed={lanyardDismissed || introPhase !== "active"}
        />
      </div>
    </>
  );
}

