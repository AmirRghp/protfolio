import { useCallback, useEffect, useRef, useState, type ComponentType, type PointerEvent as ReactPointerEvent } from "react";
import { MOBILE_ARCADE_GAMES, readArcadeHighScore } from "@/features/arcade/utils/arcadeData";
import Deparkanoid from "@/features/arcade/games/deparkanoid";
import SnakeGame from "@/features/arcade/games/snake-grid";
import FlappyGame from "@/features/arcade/games/cyber-flappy";
import TetrisGame from "@/features/arcade/games/cyber-tetris";
import PixelRunGame from "@/features/arcade/games/pixel-run";
import { flappyAudio } from "@/features/arcade/games/cyber-flappy/flappyAudio";
import { tetrisAudio } from "@/features/arcade/games/cyber-tetris/tetrisAudio";
import { pixelRunAudio } from "@/features/arcade/games/pixel-run/pixelRunAudio";
import MobileGamepad from "./MobileGamepad";
import styles from "./MobileArcadeModal.module.css";

export type MobileArcadeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialGameId?: string;
  initialPlaying?: boolean;
};

const GAME_COMPONENTS: Record<string, ComponentType<{ onExit: () => void }>> = {
  pixelrun: PixelRunGame,
  tetris: TetrisGame,
  snake: SnakeGame,
  deparkanoid: Deparkanoid,
  flappy: FlappyGame,
};

function stopAllGameAudio(): void {
  try {
    tetrisAudio.stopMusic();
    pixelRunAudio.stopMusic();
  } catch {
    /* ignore audio cleanup errors in non-browser environments */
  }
}

function applyMasterMute(muted: boolean): void {
  try {
    flappyAudio.setMuted(muted);
    tetrisAudio.setMuted(muted);
    pixelRunAudio.setMuted(muted);
  } catch {
    /* ignore audio errors in non-browser environments */
  }
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.getAttribute("aria-hidden") !== "true");
}

export default function MobileArcadeModal({
  isOpen,
  onClose,
  initialGameId = "pixelrun",
  initialPlaying = false,
}: MobileArcadeModalProps) {
  const [selectedGameId, setSelectedGameId] = useState<string>(initialGameId);
  const [isPlaying, setIsPlaying] = useState<boolean>(initialPlaying);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const startBtnRef = useRef<HTMLButtonElement>(null);
  const gameplayStageRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const selectedIndex = Math.max(
    0,
    MOBILE_ARCADE_GAMES.findIndex((g) => g.id === selectedGameId),
  );
  const selectedGame = MOBILE_ARCADE_GAMES[selectedIndex] ?? MOBILE_ARCADE_GAMES[0];
  const ActiveGameComponent = GAME_COMPONENTS[selectedGame.id];

  // Clean up audio synthesizers & master mute state whenever modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopAllGameAudio();
      applyMasterMute(false);
    }
    return () => {
      stopAllGameAudio();
      applyMasterMute(false);
    };
  }, [isOpen]);

  // Capture triggering focus on open and restore it cleanly on close
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (startBtnRef.current) {
      startBtnRef.current.focus();
    } else {
      closeBtnRef.current?.focus();
    }

    return () => {
      const prev = previousFocusRef.current;
      previousFocusRef.current = null;
      if (prev && prev.isConnected) {
        prev.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;
    if (isPlaying) {
      gameplayStageRef.current?.focus();
    } else {
      startBtnRef.current?.focus();
    }
  }, [isOpen, isPlaying]);

  const handleCloseModal = useCallback(() => {
    stopAllGameAudio();
    applyMasterMute(false);
    setIsMuted(false);
    setIsPlaying(false);
    onClose();
  }, [onClose]);

  const handleReturnToMenu = useCallback(() => {
    stopAllGameAudio();
    setIsPlaying(false);
  }, []);

  const handleStartGame = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleGamepadPause = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      applyMasterMute(next);
      return next;
    });
  }, []);

  const cycleCarousel = useCallback((delta: number) => {
    setSelectedGameId((currentId) => {
      const idx = MOBILE_ARCADE_GAMES.findIndex((g) => g.id === currentId);
      const safeIdx = idx >= 0 ? idx : 0;
      const nextIdx = (safeIdx + delta + MOBILE_ARCADE_GAMES.length) % MOBILE_ARCADE_GAMES.length;
      return MOBILE_ARCADE_GAMES[nextIdx].id;
    });
  }, []);

  const handleCardStagePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest("button")) return;
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleCardStagePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const start = swipeStartRef.current;
      swipeStartRef.current = null;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        cycleCarousel(dx < 0 ? 1 : -1);
      }
    },
    [cycleCarousel],
  );

  // Focus trap, carousel keyboard navigation, and Escape handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const focusables = getFocusableElements(modalRef.current);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
          if (active === first || !modalRef.current?.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || !modalRef.current?.contains(active)) {
          e.preventDefault();
          first.focus();
        }
        return;
      }

      if (e.key === "Escape") {
        if (e.defaultPrevented) return;
        e.preventDefault();
        if (isPlaying) {
          handleReturnToMenu();
        } else {
          handleCloseModal();
        }
        return;
      }

      if (!isPlaying) {
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          cycleCarousel(-1);
        } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          cycleCarousel(1);
        } else if (e.key === " " || e.key === "Enter") {
          const target = e.target as HTMLElement | null;
          if (target && target.tagName === "BUTTON") return;
          e.preventDefault();
          handleStartGame();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPlaying, cycleCarousel, handleCloseModal, handleReturnToMenu, handleStartGame]);

  if (!isOpen) {
    return null;
  }

  const highScore = readArcadeHighScore(selectedGame.id);

  return (
    <div
      ref={modalRef}
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="NEON POCKET Mobile Arcade Console"
      data-testid="mobile-arcade-modal"
      data-mode={isPlaying ? "playing" : "carousel"}
    >
      {/* Top Anodized Hardware Edge Bar */}
      <header className={styles.headerBar}>
        <button
          ref={closeBtnRef}
          type="button"
          className={styles.closeBtn}
          onClick={handleCloseModal}
          aria-label="Close mobile arcade"
        >
          ✕ CLOSE
        </button>

        <div className={styles.brandTitle}>
          <span className={styles.powerLed} aria-hidden="true" />
          <span>NEON POCKET</span>
        </div>

        <button
          type="button"
          className={styles.muteBtn}
          onClick={handleToggleMute}
          aria-pressed={isMuted}
          aria-label={isMuted ? "Unmute arcade audio" : "Mute arcade audio"}
        >
          <span>{isMuted ? "🔇 MUTE" : "🔊 AUDIO"}</span>
        </button>
      </header>

      {/* Main Split Console Body */}
      <div className={styles.consoleBody}>
        {/* Top 55%: Recessed Tempered Glass Display Bezel */}
        <div className={styles.screenSection}>
          <div className={styles.lensBezelOuter}>
            <div className={styles.lensTopMeta} aria-hidden="true">
              <span className={styles.lensSilkscreen}>DOT MATRIX WITH STEREO SOUND</span>
              <span className={styles.batteryIndicator}>
                <span className={styles.batteryDot} />
                BATTERY
              </span>
            </div>

            <div className={styles.crtBezel}>
              {isPlaying && ActiveGameComponent ? (
                <div
                  ref={gameplayStageRef}
                  tabIndex={-1}
                  className={styles.gameplayStage}
                  data-testid="mobile-arcade-gameplay"
                >
                  <ActiveGameComponent onExit={handleReturnToMenu} />
                </div>
              ) : (
                <div className={styles.carouselScreen} data-testid="mobile-arcade-carousel">
                  <div className={styles.carouselTopRow}>
                    <span className={styles.cartridgeBadge}>
                      CARTRIDGE 0{selectedIndex + 1} / 0{MOBILE_ARCADE_GAMES.length}
                    </span>
                    <span className={styles.highScoreBadge}>
                      HI-SCORE {String(highScore).padStart(5, "0")}
                    </span>
                  </div>

                  {/* 5-Game Selector Tabs */}
                  <div className={styles.carouselTabs} role="tablist" aria-label="Select arcade game">
                    {MOBILE_ARCADE_GAMES.map((game) => {
                      const isSelected = game.id === selectedGame.id;
                      return (
                        <button
                          key={game.id}
                          id={`mobile-arcade-tab-${game.id}`}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          aria-controls="mobile-arcade-tabpanel"
                          tabIndex={isSelected ? 0 : -1}
                          data-selected={isSelected}
                          className={styles.gameTab}
                          onClick={() => setSelectedGameId(game.id)}
                        >
                          {game.title}
                        </button>
                      );
                    })}
                  </div>

                  {/* Featured Game Cartridge Card */}
                  <div
                    className={styles.cardStage}
                    onPointerDown={handleCardStagePointerDown}
                    onPointerUp={handleCardStagePointerUp}
                    onPointerCancel={() => {
                      swipeStartRef.current = null;
                    }}
                  >
                    <button
                      type="button"
                      className={styles.navArrow}
                      onClick={() => cycleCarousel(-1)}
                      aria-label="Previous game"
                    >
                      ◀
                    </button>

                    <div
                      className={styles.gameCard}
                      role="tabpanel"
                      id="mobile-arcade-tabpanel"
                      aria-labelledby={`mobile-arcade-tab-${selectedGame.id}`}
                    >
                      {/* Smoked Polycarbonate Cartridge Artwork Banner */}
                      <div className={styles.cartridgeVisualWrap}>
                        <div className={styles.cartridgeScrim} />
                        <div className={styles.gameCardHeader}>
                          <div className={styles.gameIconWrap}>
                            {selectedGame.icon({ className: styles.gameSvg })}
                          </div>
                          <div className={styles.gameTitleBlock}>
                            <h2 className={styles.gameTitle}>{selectedGame.title}</h2>
                            <span className={styles.gameMeta}>
                              {selectedGame.system} · {selectedGame.year}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className={styles.gameDesc}>{selectedGame.description}</p>

                      <button
                        ref={startBtnRef}
                        type="button"
                        className={styles.startBtn}
                        onClick={handleStartGame}
                        aria-label={`Play ${selectedGame.title}`}
                      >
                        ▶ START GAME
                      </button>
                    </div>

                    <button
                      type="button"
                      className={styles.navArrow}
                      onClick={() => cycleCarousel(1)}
                      aria-label="Next game"
                    >
                      ▶
                    </button>
                  </div>

                  <div className={styles.carouselFooter}>
                    <span>5 NATIVE 60FPS CARTRIDGES</span>
                    <span>PS1 CRASH ON DESKTOP</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom 45%: Adaptive Touch Controller Chassis */}
        <div className={styles.gamepadSection}>
          <MobileGamepad
            activeGameId={selectedGame.id}
            isPlaying={isPlaying}
            onSelectMenu={handleReturnToMenu}
            onTogglePause={handleGamepadPause}
          />
        </div>
      </div>
    </div>
  );
}
