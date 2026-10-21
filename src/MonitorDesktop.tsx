import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { formatStatusTimestamp, useLiveClock } from "./desktopStatus";
import { clampIconOffset, desktopScale, iconBaseRects, localRect, type IconOffset, type LocalRect } from "./desktopDrag";
import GradientWaves from "./GradientWaves";
import styles from "./MonitorDesktop.module.css";

export type DesktopApp = {
  id: string;
  label: string;
  title: string;
  icon: ReactNode;
  content: ReactNode;
  /** How the icon opens its window. Defaults to a single click. */
  activation?: "click" | "double-click";
};

type MonitorDesktopProps = {
  apps?: DesktopApp[];
  /** The desktop is only interactive while the monitor is focused. */
  active?: boolean;
  /** The window owned by the room state; it survives the overview but not the other destinations. */
  openAppId?: string | null;
  onOpenAppChange?: (appId: string | null) => void;
  onExit?: () => void;
  ref?: Ref<HTMLDivElement>;
};

function WifiIcon() {
  return (
    <svg className={styles.indicator} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2.6 8.6a14.6 14.6 0 0 1 18.8 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 12.3a9.8 9.8 0 0 1 12 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.3 15.9a5 5 0 0 1 5.4 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="19.2" r="1.5" fill="currentColor" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg className={styles.indicator} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3.6 9.4h3.3L11.4 5v14L6.9 14.6H3.6z" fill="currentColor" />
      <path d="M15 9.2a4.2 4.2 0 0 1 0 5.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17.8 6.6a7.9 7.9 0 0 1 0 10.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StatusBar({ ref }: { ref?: Ref<HTMLElement> }) {
  const now = useLiveClock();
  const timestamp = formatStatusTimestamp(now);

  return (
    <header className={styles.statusBar} ref={ref}>
      <span className={styles.workspace}>Amirreza Workspace</span>
      <span className={styles.statusMeta}>
        <WifiIcon />
        <VolumeIcon />
        <time className={styles.clock} dateTime={timestamp.iso}>{timestamp.label}</time>
      </span>
    </header>
  );
}

/** A file opens on a double activation; the same threshold covers a mouse double click and a touch double tap. */
const DOUBLE_ACTIVATION_MS = 500;

/** The ways a file can be opened, spelled out for the accessible description of its icon. */
const ACTIVATION_HINT = "Double-click, double tap, or press Enter to open";

/** How far a pointer may move before the gesture counts as a drag instead of a click. */
const DRAG_THRESHOLD_PX = 4;

type Activation = { id: string; at: number };

type DragState = {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  origin: IconOffset;
  scale: number;
  base: LocalRect;
  moved: boolean;
};

/** Counts an activation on an icon and reports whether it completes a double activation. */
function registerActivation(previous: Activation | null, id: string): { state: Activation | null; doubled: boolean } {
  const now = Date.now();
  const doubled = previous !== null && previous.id === id && now - previous.at <= DOUBLE_ACTIVATION_MS;
  return { state: doubled ? null : { id, at: now }, doubled };
}

export function DesktopWindow({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children?: ReactNode;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => { closeButton.current?.focus(); }, []);

  return (
    <section
      className={styles.window}
      aria-labelledby="monitor-window-title"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        onClose();
      }}
    >
      <header className={styles.windowBar}>
        <span className={styles.windowTitle} id="monitor-window-title">{title}</span>
        <button ref={closeButton} type="button" className={styles.windowClose} onClick={onClose}>Close</button>
      </header>
      <div className={styles.windowBody} role="group" aria-label={`${title} content`} tabIndex={0}>{children}</div>
    </section>
  );
}

export default function MonitorDesktop({
  apps = [],
  active = true,
  openAppId = null,
  onOpenAppChange,
  onExit,
  ref,
}: MonitorDesktopProps) {
  const [offsets, setOffsets] = useState<Record<string, IconOffset>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const lastActivation = useRef<Activation | null>(null);
  const drag = useRef<DragState | null>(null);
  const draggedClick = useRef(false);
  const desktopElement = useRef<HTMLDivElement | null>(null);
  const iconList = useRef<HTMLUListElement | null>(null);
  const statusBar = useRef<HTMLElement | null>(null);
  const openApp = apps.find((app) => app.id === openAppId) ?? null;

  /** Drops a pending activation, so only a real second activation of the same icon opens a file. */
  const clearActivation = () => {
    lastActivation.current = null;
  };

  const closeWindow = () => {
    clearActivation();
    onOpenAppChange?.(null);
    opener.current?.focus();
  };

  const showApp = (app: DesktopApp, trigger: HTMLButtonElement) => {
    clearActivation();
    opener.current = trigger;
    onOpenAppChange?.(app.id);
  };

  /** Counts a double activation on the same icon, so a single click or tap only selects the file. */
  const countDoubleActivation = (app: DesktopApp, trigger: HTMLButtonElement) => {
    const { state, doubled } = registerActivation(lastActivation.current, app.id);
    lastActivation.current = state;
    if (!doubled) return;
    showApp(app, trigger);
  };

  /** Starts a drag; a click without movement still activates the app. */
  const startDrag = (event: React.PointerEvent<HTMLButtonElement>, app: DesktopApp) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const desktop = desktopElement.current;
    const list = iconList.current;
    const item = event.currentTarget.closest("li");
    if (!desktop || !list || !item) return;

    draggedClick.current = false;
    drag.current = {
      id: app.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: offsets[app.id] ?? { x: 0, y: 0 },
      scale: desktopScale(desktop),
      base: localRect(desktop, item),
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  /** Moves the dragged icon and keeps it inside the desktop. */
  const moveDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = drag.current;
    const desktop = desktopElement.current;
    if (!state || !desktop || state.pointerId !== event.pointerId) return;

    const dx = (event.clientX - state.startX) / state.scale;
    const dy = (event.clientY - state.startY) / state.scale;
    if (!state.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

    state.moved = true;
    setDraggingId(state.id);
    const offset = clampIconOffset(state.base, { x: state.origin.x + dx, y: state.origin.y + dy }, {
      width: desktop.offsetWidth,
      height: desktop.offsetHeight,
      top: statusBar.current?.offsetHeight ?? 0,
    });
    setOffsets((current) => ({ ...current, [state.id]: offset }));
  };

  /** Ends a drag; a moved icon must not activate its app. */
  const endDrag = (event: React.PointerEvent<HTMLButtonElement>, cancelled = false) => {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    drag.current = null;
    setDraggingId(null);
    // A cancelled gesture produces no click, so there is nothing to suppress afterwards.
    draggedClick.current = cancelled ? false : state.moved;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  // The projected size of the desktop follows the viewport, so an offset that was valid before a
  // resize can leave the screen. Every stored offset is clamped again whenever the desktop is
  // laid out anew.
  useEffect(() => {
    const desktop = desktopElement.current;
    const list = iconList.current;
    if (!desktop || !list) return;

    const observer = new ResizeObserver(() => {
      setOffsets((current) => {
        const bounds = {
          width: desktop.offsetWidth,
          height: desktop.offsetHeight,
          top: statusBar.current?.offsetHeight ?? 0,
        };
        const bases = iconBaseRects(desktop, list);
        const next = { ...current };
        let changed = false;
        for (const [id, offset] of Object.entries(current)) {
          const base = bases.get(id);
          if (!base) continue;
          const clamped = clampIconOffset(base, offset, bounds);
          if (clamped.x !== offset.x || clamped.y !== offset.y) {
            next[id] = clamped;
            changed = true;
          }
        }
        return changed ? next : current;
      });
    });

    observer.observe(desktop);
    return () => observer.disconnect();
  }, []);

  // A pending activation only survives while the same icon is activated again, so every other
  // interaction in the whole interface drops it: pointers, focus moves and key presses, inside the
  // desktop and outside of it.
  useEffect(() => {
    if (!active) {
      lastActivation.current = null;
      return;
    }

    const dropActivationOnOtherInteraction = (event: Event) => {
      const pending = lastActivation.current;
      if (!pending) return;
      const target = event.target;
      const icon = target instanceof Element ? target.closest<HTMLElement>("[data-app-id]") : null;
      if (icon?.dataset.appId === pending.id) return;
      lastActivation.current = null;
    };

    document.addEventListener("pointerdown", dropActivationOnOtherInteraction, true);
    document.addEventListener("focusin", dropActivationOnOtherInteraction, true);
    document.addEventListener("keydown", dropActivationOnOtherInteraction, true);
    return () => {
      document.removeEventListener("pointerdown", dropActivationOnOtherInteraction, true);
      document.removeEventListener("focusin", dropActivationOnOtherInteraction, true);
      document.removeEventListener("keydown", dropActivationOnOtherInteraction, true);
    };
  }, [active]);

  return (
    <div
      className={styles.desktop}
      ref={(element) => {
        desktopElement.current = element;
        if (typeof ref === "function") ref(element);
        else if (ref) ref.current = element;
      }}
      tabIndex={-1}
      role="region"
      aria-label="Amirreza workspace"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        // Escape closes the open window first, even when the focus sits on the desktop itself.
        if (openApp) {
          closeWindow();
          return;
        }
        onExit?.();
      }}
    >
      <div className={styles.wallpaper} aria-hidden="true">
        <GradientWaves
          horizonColor="#1e3a8a"
          waveColor="#38bdf8"
          crestColor="#e0f2fe"
          speed={0.5}
          amplitude={1.8}
          relief={1}
          lightAngle={150}
          mouseInteraction={active}
          swellOnClick={active}
          waveScale={0.9}
          swell={25}
          turbulence={28}
          quality="low"
          intro={false}
          paused={!active}
        />
      </div>
      <StatusBar ref={statusBar} />
      <ul className={styles.icons} ref={iconList}>
        {apps.map((app) => {
          const needsDoubleClick = app.activation === "double-click";
          const hintId = `${app.id}-activation-hint`;
          const offset = offsets[app.id];
          return (
            <li
              key={app.id}
              className={styles.iconItem}
              data-dragging={draggingId === app.id ? "true" : undefined}
              style={offset ? { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` } : undefined}
            >
              <button
                type="button"
                className={styles.icon}
                data-app-id={app.id}
                title={needsDoubleClick ? ACTIVATION_HINT : undefined}
                aria-describedby={needsDoubleClick ? hintId : undefined}
                onPointerDown={(event) => startDrag(event, app)}
                onPointerMove={moveDrag}
                onPointerUp={(event) => endDrag(event)}
                onPointerCancel={(event) => endDrag(event, true)}
                onClick={(event) => {
                  // Only the click that comes from the pointer of a finished drag is suppressed.
                  // A click generated by the keyboard is never swallowed by a pending drag.
                  const suppressed = draggedClick.current && event.detail > 0;
                  draggedClick.current = false;
                  if (suppressed) return;
                  if (!needsDoubleClick) {
                    showApp(app, event.currentTarget);
                    return;
                  }
                  countDoubleActivation(app, event.currentTarget);
                }}
                onKeyDown={(event) => {
                  if (!needsDoubleClick || event.key !== "Enter") return;
                  event.preventDefault();
                  showApp(app, event.currentTarget);
                }}
              >
                <span className={styles.iconTile} aria-hidden="true">{app.icon}</span>
                <span className={styles.iconLabel}>{app.label}</span>
              </button>
              {needsDoubleClick && <span id={hintId} className={styles.visuallyHidden}>{ACTIVATION_HINT}</span>}
            </li>
          );
        })}
      </ul>
      {openApp && (
        <DesktopWindow title={openApp.title} onClose={closeWindow}>
          {openApp.content}
        </DesktopWindow>
      )}
    </div>
  );
}
