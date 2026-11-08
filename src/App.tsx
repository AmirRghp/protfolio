import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { LanyardIntro, getInitialIntroPhaseFromSearch, type IntroPhase } from "@/features/lanyard";
import { RoomPreview, roomNavigationReducer, initialRoomNavigation, oiiaAudio, type RoomDestination, type RoomNavigationState } from "@/features/room";
import { FlatLanding, captureSceneSnapshot } from "@/features/landing";
import { MagicCursor } from "@/core";

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
  const [navigation, dispatch] = useReducer(roomNavigationReducer, undefined, getInitialNavigation);
  const [introPhase, setIntroPhase] = useState<IntroPhase>(getInitialIntroPhase);
  const [lanyardDismissed, setLanyardDismissed] = useState<boolean>(
    () => getInitialIntroPhase() !== "active",
  );
  const [viewMode, setViewMode] = useState<"room" | "flat">(getInitialViewMode);
  const [snapshotCanvas, setSnapshotCanvas] = useState<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const handleLanyardEnter = useCallback(() => {
    setIntroPhase((prev) => (prev === "active" ? "building" : prev));
  }, []);

  const handleLanyardDismissed = useCallback(() => {
    setLanyardDismissed(true);
  }, []);

  const handleBuildComplete = useCallback(() => {
    setIntroPhase("ready");
  }, []);

  const handleExitToFlat = useCallback(() => {
    oiiaAudio.reset();
    const snapshot = captureSceneSnapshot(previewContainerRef.current);
    setSnapshotCanvas(snapshot);
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
    setViewMode("room");
    if (typeof window !== "undefined") {
      try {
        window.history.pushState(null, "", "#room");
      } catch {
        // Safe fallback
      }
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#portfolio") {
        setViewMode("flat");
      } else if (window.location.hash === "#room" || window.location.hash === "") {
        setViewMode("room");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.classList.toggle("away", viewMode === "flat");
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove("away");
      document.body.style.overflow = "";
    };
  }, [viewMode]);

  return (
    <>
      {!lanyardDismissed && (
        <LanyardIntro
          onEnter={handleLanyardEnter}
          onDismissed={handleLanyardDismissed}
        />
      )}
      <MagicCursor />
      <div className="site-shell" data-intro-phase={introPhase} data-view-mode={viewMode}>
        <div
          ref={previewContainerRef}
          aria-hidden={viewMode === "flat"}
          style={{
            pointerEvents: viewMode === "flat" ? "none" : "auto",
            userSelect: viewMode === "flat" ? "none" : "auto",
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
        <FlatLanding
          isOpen={viewMode === "flat"}
          snapshotCanvas={snapshotCanvas}
          onReenter={handleReenterRoom}
        />
      </div>
    </>
  );
}
