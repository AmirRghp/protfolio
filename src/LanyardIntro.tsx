import { getAssetUrl } from "./assetUrl";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Lanyard from "./Lanyard";
import { LANYARD_PULL_MIN_PX } from "./lanyardPull";
import styles from "./LanyardIntro.module.css";

const CARD_IMAGE_PATH = getAssetUrl("assets/lanyard-photo.webp");
const EXIT_DURATION_MS = 480;

export type LanyardIntroProps = {
  onEnter: () => void;
  onDismissed: () => void;
};

export default function LanyardIntro({ onEnter, onDismissed }: LanyardIntroProps) {
  const [state, setState] = useState<"active" | "exiting">("active");
  const [pullProgress, setPullProgress] = useState(0);
  const triggeredRef = useRef(false);
  const exitTimerRef = useRef<number>(0);

  const triggerSmoothExit = useCallback(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setPullProgress(1);
    setState("exiting");
    onEnter();
    const reduced =
      typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
    exitTimerRef.current = window.setTimeout(
      () => {
        onDismissed();
      },
      reduced ? 200 : EXIT_DURATION_MS,
    );
  }, [onEnter, onDismissed]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  const handlePullProgress = useCallback((progress: number) => {
    if (triggeredRef.current) return;
    setPullProgress(progress);
  }, []);

  useEffect(() => {
    if (state !== "active") {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "Escape"
      ) {
        event.preventDefault();
        triggerSmoothExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, triggerSmoothExit]);

  return (
    <div
      className={styles.overlay}
      data-testid="lanyard-intro"
      data-state={state}
      aria-label="Portfolio loading screen"
    >
      <div className={styles.lanyardStage}>
        <Lanyard
          frontImage={CARD_IMAGE_PATH}
          backImage={CARD_IMAGE_PATH}
          finish="holographic"
          orientation="portrait"
          cornerRadius={0.3}
          size={0.58}
          anchor="center"
          strapLength={0.56}
          strapColor="#111111"
          strapWidth={0.65}
          metal="silver"
          gravity={1}
          damping={0.5}
          elasticity={0.5}
          breeze={0.5}
          interactive={state === "active"}
          intro={true}
          pullThreshold={LANYARD_PULL_MIN_PX}
          onPullProgress={handlePullProgress}
          onPullComplete={triggerSmoothExit}
          onUnavailable={triggerSmoothExit}
        />
      </div>
      <button
        type="button"
        className={styles.promptBlock}
        data-pulling={pullProgress > 0.05}
        style={{ "--pull-progress": pullProgress.toFixed(3) } as CSSProperties}
        onClick={triggerSmoothExit}
        aria-label="Pull down to enter or press Enter to enter portfolio"
      >
        <p className={styles.promptText}>Pull down to enter</p>
        <div className={styles.progressTrack} aria-hidden="true">
          <div className={styles.progressFill} />
        </div>
      </button>
    </div>
  );
}
