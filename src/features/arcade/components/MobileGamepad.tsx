import { useCallback, useEffect, useRef, useState } from "react";
import {
  GAME_CONTROL_PROFILES,
  pressKey,
  releaseKey,
  type GameControlProfile,
} from "@/features/arcade/utils/arcadeData";
import styles from "./MobileGamepad.module.css";

export { GAME_CONTROL_PROFILES, type GameControlProfile };

export type MobileGamepadProps = {
  activeGameId: string;
  onSelectMenu: () => void;
  onTogglePause?: () => void;
};

type DpadButtonDef = {
  id: string;
  label: string;
  ariaLabel: string;
  key: string;
  code: string;
  className: string;
};

const DPAD_BUTTONS: DpadButtonDef[] = [
  {
    id: "dpad-up",
    label: "▲",
    ariaLabel: "D-Pad Up",
    key: "ArrowUp",
    code: "ArrowUp",
    className: styles.dpadUp,
  },
  {
    id: "dpad-left",
    label: "◀",
    ariaLabel: "D-Pad Left",
    key: "ArrowLeft",
    code: "ArrowLeft",
    className: styles.dpadLeft,
  },
  {
    id: "dpad-right",
    label: "▶",
    ariaLabel: "D-Pad Right",
    key: "ArrowRight",
    code: "ArrowRight",
    className: styles.dpadRight,
  },
  {
    id: "dpad-down",
    label: "▼",
    ariaLabel: "D-Pad Down",
    key: "ArrowDown",
    code: "ArrowDown",
    className: styles.dpadDown,
  },
];

export default function MobileGamepad({
  activeGameId,
  onSelectMenu,
  onTogglePause,
}: MobileGamepadProps) {
  const profile: GameControlProfile =
    GAME_CONTROL_PROFILES[activeGameId] ?? GAME_CONTROL_PROFILES.tetris;

  const activeKeysRef = useRef<Map<string, { key: string; code?: string }>>(new Map());
  const [pressedIds, setPressedIds] = useState<Record<string, boolean>>({});

  // Release any held keys when switching games or unmounting
  useEffect(() => {
    const activeMap = activeKeysRef.current;
    return () => {
      activeMap.forEach(({ key, code }) => {
        releaseKey(key, code);
      });
      activeMap.clear();
    };
  }, [activeGameId]);

  const handlePress = useCallback((id: string, key: string, code?: string) => {
    if (activeKeysRef.current.has(id)) return;
    activeKeysRef.current.set(id, { key, code });
    setPressedIds((prev) => ({ ...prev, [id]: true }));
    pressKey(key, code);
  }, []);

  const handleRelease = useCallback((id: string, key: string, code?: string) => {
    if (!activeKeysRef.current.has(id)) return;
    activeKeysRef.current.delete(id);
    setPressedIds((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    releaseKey(key, code);
  }, []);

  const handlePauseClick = useCallback(() => {
    pressKey("p", "KeyP");
    releaseKey("p", "KeyP");
    if (onTogglePause) {
      onTogglePause();
    }
  }, [onTogglePause]);

  const primaryAction = profile.actions[0] ?? {
    id: "reflex-primary",
    label: "ACTION",
    key: " ",
    code: "Space",
  };

  return (
    <div
      className={styles.gamepadChassis}
      role="group"
      aria-label="Handheld arcade touch controller"
      data-game-id={activeGameId}
    >
      {/* Decorative hardware screw heads in corners */}
      <span className={`${styles.screw} ${styles.screwTopLeft}`} aria-hidden="true" />
      <span className={`${styles.screw} ${styles.screwTopRight}`} aria-hidden="true" />
      <span className={`${styles.screw} ${styles.screwBottomLeft}`} aria-hidden="true" />
      <span className={`${styles.screw} ${styles.screwBottomRight}`} aria-hidden="true" />

      <div className={styles.controlsRow}>
        {/* Left Zone: Molded 4-Way Cross D-Pad or Tactile Thumb Rocker Pad */}
        <div className={styles.leftZone}>
          {profile.showDpad ? (
            <div className={styles.dpadContainer} role="group" aria-label="Directional Pad">
              <div className={styles.dpadCrossBacking} aria-hidden="true" />
              {DPAD_BUTTONS.map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  aria-label={btn.ariaLabel}
                  data-dpad={btn.id}
                  data-pressed={pressedIds[btn.id] ? "true" : undefined}
                  className={`${styles.dpadBtn} ${btn.className}`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    handlePress(btn.id, btn.key, btn.code);
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    handleRelease(btn.id, btn.key, btn.code);
                  }}
                  onPointerCancel={() => handleRelease(btn.id, btn.key, btn.code)}
                  onPointerLeave={() => handleRelease(btn.id, btn.key, btn.code)}
                >
                  <span className={styles.dpadGlyph}>{btn.label}</span>
                </button>
              ))}
              <div className={styles.dpadCenter} aria-hidden="true">
                <span className={styles.dpadPivotIndentation} />
              </div>
            </div>
          ) : (
            <div className={styles.reflexDeck} aria-label="Direct action mode">
              <button
                type="button"
                className={styles.thumbPadDisc}
                aria-label={`Thumb pad ${primaryAction.label}`}
                data-pressed={pressedIds["thumb-disc"] ? "true" : undefined}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  handlePress("thumb-disc", primaryAction.key, primaryAction.code);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  handleRelease("thumb-disc", primaryAction.key, primaryAction.code);
                }}
                onPointerCancel={() =>
                  handleRelease("thumb-disc", primaryAction.key, primaryAction.code)
                }
                onPointerLeave={() =>
                  handleRelease("thumb-disc", primaryAction.key, primaryAction.code)
                }
              >
                <span className={styles.thumbPadRing}>
                  <span className={styles.thumbPadCenterDot} />
                </span>
              </button>
              <span className={styles.reflexHint}>TOUCH PAD</span>
            </div>
          )}
        </div>

        {/* Center Zone: Silicone Angled MENU (SELECT) & PAUSE (START) Buttons */}
        <div className={styles.centerZone}>
          <div className={styles.systemButtons}>
            <div className={styles.sysBtnSlot}>
              <button
                type="button"
                className={styles.sysBtn}
                onClick={onSelectMenu}
                aria-label="Return to arcade game menu"
              >
                <span className={styles.sysPillCap} />
                <span className={styles.sysBtnLabel}>MENU</span>
              </button>
            </div>

            <div className={styles.sysBtnSlot}>
              <button
                type="button"
                className={styles.sysBtn}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePauseClick();
                }}
                onClick={(e) => {
                  // Keyboard activation fallback (detail === 0)
                  if (e.detail === 0) {
                    handlePauseClick();
                  }
                }}
                aria-label="Pause or resume game"
              >
                <span className={styles.sysPillCap} />
                <span className={styles.sysBtnLabel}>PAUSE</span>
              </button>
            </div>
          </div>

          {/* Machined Speaker Perforation Array */}
          <div className={styles.speakerGrille} aria-hidden="true">
            {Array.from({ length: 12 }).map((_, idx) => (
              <span key={idx} className={styles.speakerHole} />
            ))}
          </div>
        </div>

        {/* Right Zone: Contextual Tactile Action Buttons */}
        <div className={styles.rightZone}>
          <div
            className={styles.actionCluster}
            data-count={profile.actions.length}
            role="group"
            aria-label="Action Buttons"
          >
            {profile.actions.map((action, idx) => (
              <div key={action.id} className={styles.actionSocket}>
                <button
                  type="button"
                  aria-label={action.label}
                  data-action-id={action.id}
                  data-color={action.color ?? "cyan"}
                  data-pressed={pressedIds[action.id] ? "true" : undefined}
                  className={styles.actionBtn}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    handlePress(action.id, action.key, action.code);
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    handleRelease(action.id, action.key, action.code);
                  }}
                  onPointerCancel={() => handleRelease(action.id, action.key, action.code)}
                  onPointerLeave={() => handleRelease(action.id, action.key, action.code)}
                >
                  <span className={styles.actionBtnText}>{action.label}</span>
                </button>
                <span className={styles.actionSilkscreen} aria-hidden="true">
                  {idx === 0 ? "A" : idx === 1 ? "B" : "C"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottomBar} aria-hidden="true">
        <span>MODEL DMG-05 · TACTILE SHELL</span>
        <span>STEREO SOUND</span>
      </div>
    </div>
  );
}
