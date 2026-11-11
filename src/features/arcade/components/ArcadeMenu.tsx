import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  ARCADE_GAMES,
  ARCADE_GAME_URL,
  ARCADE_LOAD_TIMEOUT_MS,
} from "@/features/arcade/utils/arcadeData";
import Deparkanoid from "@/features/arcade/games/deparkanoid";
import SnakeGame from "@/features/arcade/games/snake-grid";
import FlappyGame from "@/features/arcade/games/cyber-flappy";
import TetrisGame from "@/features/arcade/games/cyber-tetris";
import PixelRunGame from "@/features/arcade/games/pixel-run";
import styles from "./ArcadeMenu.module.css";

const INTERNAL_GAME_CONFIG: Record<
  string,
  {
    hintId: string;
    hintText: string;
    tagline: string;
    Component: ComponentType<{ onExit: () => void }>;
  }
> = {
  deparkanoid: {
    hintId: "deparkanoid-hint",
    hintText: "Mouse / Arrows: Move · Space / Click: Launch · Esc: Exit",
    tagline: "5 Handcrafted Levels · Authentic Departure Mono · Ricochet Physics",
    Component: Deparkanoid,
  },
  snake: {
    hintId: "snake-hint",
    hintText: "Arrows / WASD: Move · Space: Action · Esc: Exit",
    tagline: "5 Campaign Levels · Cyber Obstacles · Golden Apples · Departure Mono",
    Component: SnakeGame,
  },
  pixelrun: {
    hintId: "pixelrun-hint",
    hintText: "Space/Up: Jump · Down: Duck/Slide · M: Music · Esc: Exit",
    tagline: "5 Cyber Sectors · Variable Jump & Slide-Duck · Aerial Drones · 8-Bit Chiptunes",
    Component: PixelRunGame,
  },
  tetris: {
    hintId: "tetris-hint",
    hintText: "Arrows/WASD: Move/Rotate · Space: Hard Drop · C: Hold · M: Music · Esc: Exit",
    tagline: "5 Cyber Sectors · SRS Wall Kicks · Ghost Piece · Hold Matrix · Chiptune Music",
    Component: TetrisGame,
  },
  flappy: {
    hintId: "flappy-hint",
    hintText: "Space / Up / Click: Flap · Esc: Exit",
    tagline: "5 Cyber Sectors · Laser Conduit Pylons · Bonus Data Orbs · Departure Mono",
    Component: FlappyGame,
  },
};

export type ArcadeMenuProps = {
  active: boolean;
  outsideHover?: boolean;
  onExit: () => void;
};

const ArcadeMenu = forwardRef<HTMLDivElement, ArcadeMenuProps>(function ArcadeMenu(
  { active, outsideHover = false, onExit },
  forwardedRef,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const exitButtonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const loadTimeout = useRef<number | null>(null);

  useImperativeHandle(forwardedRef, () => containerRef.current as HTMLDivElement);

  const [selectedGameId, setSelectedGameId] = useState<string>("crash");
  const [playing, setPlaying] = useState<boolean>(false);
  const [loadTimedOut, setLoadTimedOut] = useState<boolean>(false);

  const selectedGame = ARCADE_GAMES.find((g) => g.id === selectedGameId) ?? ARCADE_GAMES[0];

  const clearLoadTimeout = useCallback(() => {
    if (loadTimeout.current !== null) {
      window.clearTimeout(loadTimeout.current);
      loadTimeout.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    if (!selectedGame.playable) return;
    clearLoadTimeout();
    setLoadTimedOut(false);
    setPlaying(true);
    if (selectedGame.id === "crash") {
      loadTimeout.current = window.setTimeout(() => {
        loadTimeout.current = null;
        setLoadTimedOut(true);
      }, ARCADE_LOAD_TIMEOUT_MS);
    }
  }, [clearLoadTimeout, selectedGame.id, selectedGame.playable]);

  const exitGame = useCallback(() => {
    clearLoadTimeout();
    setLoadTimedOut(false);
    setPlaying(false);
  }, [clearLoadTimeout]);

  // When returning to room or un-focusing arcade, stop game playback
  useEffect(() => {
    if (!active) {
      exitGame();
    }
  }, [active, exitGame]);

  const handleFrameLoad = () => {
    clearLoadTimeout();
  };

  useEffect(() => () => {
    if (loadTimeout.current !== null) window.clearTimeout(loadTimeout.current);
  }, []);

  // Manage focus between play and exit buttons, or container when viewing unplayable games
  useEffect(() => {
    if (!active) return;
    const focusTarget = () => {
      if (playing) {
        if (!(selectedGame.id in INTERNAL_GAME_CONFIG)) {
          exitButtonRef.current?.focus({ preventScroll: true });
        }
      } else if (playButtonRef.current) {
        playButtonRef.current.focus({ preventScroll: true });
      } else {
        containerRef.current?.focus({ preventScroll: true });
      }
    };

    focusTarget();
    const frameId = window.requestAnimationFrame(focusTarget);
    const timer = window.setTimeout(focusTarget, 60);

    // When the container is not yet projected, its CSS visibility is hidden, which prevents
    // browsers from giving it focus. Once ArcadeOverlay sets data-projected="true", focus the target.
    const container = containerRef.current;
    let observer: MutationObserver | null = null;
    if (container && container.dataset.projected !== "true") {
      observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "attributes" && mutation.attributeName === "data-projected") {
            if (container.dataset.projected === "true") {
              focusTarget();
            }
          }
        }
      });
      observer.observe(container, { attributes: true, attributeFilter: ["data-projected"] });
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, [active, playing, selectedGameId, selectedGame.id, loadTimedOut]);

  // Global window keydown listener so ArrowUp / ArrowDown and Enter work immediately upon entering
  // the arcade view, regardless of whether canvas or a child button currently holds focus.
  useEffect(() => {
    if (!active || playing) return;

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedGameId((currentId) => {
          const currentIndex = ARCADE_GAMES.findIndex((g) => g.id === currentId);
          const nextIndex =
            event.key === "ArrowDown"
              ? (currentIndex + 1) % ARCADE_GAMES.length
              : (currentIndex - 1 + ARCADE_GAMES.length) % ARCADE_GAMES.length;
          const nextId = ARCADE_GAMES[nextIndex].id;
          queueMicrotask(() => {
            optionRefs.current[nextId]?.focus({ preventScroll: true });
          });
          return nextId;
        });
      } else if (event.key === "Enter") {
        if (target && (target.tagName === "BUTTON" || target.tagName === "A")) return;
        const currentGame = ARCADE_GAMES.find((g) => g.id === selectedGameId);
        if (currentGame?.playable) {
          event.preventDefault();
          startGame();
        }
      }
    };

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [active, playing, selectedGameId, startGame]);

  // Local container keydown listener: handles Escape
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!active) return;

    if (event.key === "Escape") {
      event.stopPropagation();
      if (playing) {
        exitGame();
      } else {
        onExit();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.arcadeScreenContainer}
      tabIndex={active ? 0 : -1}
      data-active={active}
      data-outside-hover={outsideHover ? "true" : undefined}
      onKeyDown={handleKeyDown}
      role={active ? "region" : undefined}
      aria-label={active ? `${selectedGame.title} arcade screen` : undefined}
      aria-hidden={!active}
    >
      {playing ? (
        <div className={styles.gameplayContainer}>
          {selectedGame.id in INTERNAL_GAME_CONFIG ? (
            (() => {
              const { hintId, hintText, Component } = INTERNAL_GAME_CONFIG[selectedGame.id];
              return (
                <>
                  <div className={styles.gameplayHud}>
                    <button
                      ref={exitButtonRef}
                      type="button"
                      className={styles.hudExitButton}
                      onClick={exitGame}
                    >
                      Exit game
                    </button>
                    <p id={hintId} className={styles.arcadeHint}>
                      {hintText}
                    </p>
                  </div>
                  <div className={`${styles.gameViewport} ${styles.arcadeViewport}`}>
                    <Component onExit={exitGame} />
                  </div>
                </>
              );
            })()
          ) : loadTimedOut ? (
            <div className={styles.timeoutFallback}>
              <h2>Crash Bandicoot</h2>
              <p role="status">
                The game did not appear in the arcade within 8 seconds. Open it directly on PS1FUN with the link below.
              </p>
              <button
                ref={exitButtonRef}
                type="button"
                className={styles.playButton}
                onClick={exitGame}
              >
                Exit game
              </button>
              <a href={ARCADE_GAME_URL} target="_blank" rel="noopener noreferrer" className={styles.hudLink}>
                Open game on PS1FUN
              </a>
            </div>
          ) : (
            <>
              <div className={styles.gameplayHud}>
                <button
                  ref={exitButtonRef}
                  type="button"
                  className={styles.hudExitButton}
                  onClick={exitGame}
                >
                  Exit game
                </button>
                <p id="arcade-embed-hint" className={styles.arcadeHint}>
                  If the game does not appear, open it directly on PS1FUN.
                </p>
                <a
                  href={ARCADE_GAME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.hudLink}
                >
                  Open game on PS1FUN
                </a>
              </div>
              <div className={`${styles.gameViewport} ${styles.arcadeViewport}`}>
                <iframe
                  title="Crash Bandicoot on PS1FUN"
                  src={ARCADE_GAME_URL}
                  scrolling="no"
                  allow="fullscreen; gamepad; autoplay"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin"
                  referrerPolicy="no-referrer"
                  onLoad={handleFrameLoad}
                  aria-describedby="arcade-embed-hint"
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={styles.screenBezel}>
          <div className={styles.outerFrame}>
            <div className={styles.topBar}>
              <button
                type="button"
                className={styles.closeButton}
                onClick={onExit}
                aria-label="Close arcade and return to room"
              >
                CLOSE [ESC]
              </button>
              <div className={styles.topTabs}>
                <span>— GAMES —</span>
                <span>— PREVIEW —</span>
              </div>
              <span style={{ fontSize: "0.68rem", opacity: 0.8 }}>SYSTEM READY</span>
            </div>

            <div className={styles.mainSection}>
              {/* Left Column: Games list */}
              <div className={styles.listPanel}>
                <div className={styles.panelHeader}>Arcade Select</div>
                <div
                  className={styles.gamesList}
                  role="listbox"
                  aria-label="Games list"
                  aria-activedescendant={`arcade-option-${selectedGame.id}`}
                >
                  {ARCADE_GAMES.map((game) => {
                    const isSelected = game.id === selectedGameId;
                    return (
                      <button
                        key={game.id}
                        id={`arcade-option-${game.id}`}
                        ref={(el) => {
                          optionRefs.current[game.id] = el;
                        }}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        data-selected={isSelected}
                        className={styles.gameItem}
                        onClick={() => setSelectedGameId(game.id)}
                      >
                        <span className={styles.gameItemTitle}>
                          {isSelected ? "> " : "  "}
                          {game.title}
                        </span>
                        <span className={game.playable ? styles.badgePlay : styles.badgeSoon}>
                          {game.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Preview area */}
              <div className={styles.previewPanel}>
                <h3 className={styles.previewTitle}>{selectedGame.title}</h3>
                <span className={styles.previewSystem}>
                  {selectedGame.system} · {selectedGame.year}
                </span>

                <div className={styles.previewArtBox}>
                  {selectedGame.icon({ className: styles.previewSvg })}
                </div>

                <p className={styles.previewDescription}>{selectedGame.description}</p>
                {selectedGame.controls && (
                  <p className={styles.previewControls}>{selectedGame.controls}</p>
                )}

                {selectedGame.playable ? (
                  <>
                    <button
                      ref={playButtonRef}
                      type="button"
                      className={styles.playButton}
                      onClick={startGame}
                    >
                      Play game
                    </button>
                    {selectedGame.id === "crash" ? (
                      <>
                        <p style={{ margin: 0, fontSize: "0.58rem", opacity: 0.8 }}>
                          Hosted by PS1FUN. The game loads after you choose to play.
                        </p>
                        <a
                          href={ARCADE_GAME_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.hudLink}
                        >
                          Open game on PS1FUN
                        </a>
                      </>
                    ) : (
                      <p style={{ margin: 0, fontSize: "0.58rem", opacity: 0.8 }}>
                        {INTERNAL_GAME_CONFIG[selectedGame.id]?.tagline}
                      </p>
                    )}
                  </>
                ) : (
                  <div className={styles.disabledTag}>COMING SOON</div>
                )}
              </div>
            </div>

            {/* Bottom Row: Quick-action cards */}
            <div className={styles.bottomCards}>
              {ARCADE_GAMES.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  data-playable={game.playable}
                  className={styles.cardItem}
                  onClick={() => {
                    setSelectedGameId(game.id);
                    if (game.playable) startGame();
                  }}
                  title={game.playable ? `Play ${game.title}` : `${game.title} (Coming Soon)`}
                >
                  {game.icon({ className: styles.cardIcon })}
                  <span className={styles.cardTitle}>{game.title}</span>
                  <span className={styles.cardStatus}>
                    {game.playable ? "PLAY NOW" : "COMING SOON"}
                  </span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className={styles.footerBar}>
              <span>↑/↓ NAVIGATE · ENTER SELECT · ESC CLOSE</span>
              <span>— ARCADE V1.0 —</span>
            </div>
          </div>
        </div>
      )}
      <div className={styles.crtHighlightFrame} aria-hidden="true">
        <span className={`${styles.arcadeCornerNotch} ${styles.notchTopLeft}`} />
        <span className={`${styles.arcadeCornerNotch} ${styles.notchTopRight}`} />
        <span className={`${styles.arcadeCornerNotch} ${styles.notchBottomLeft}`} />
        <span className={`${styles.arcadeCornerNotch} ${styles.notchBottomRight}`} />
      </div>
    </div>
  );
});

export default ArcadeMenu;
