import { useEffect, useRef, useState, type KeyboardEventHandler, type PointerEventHandler, type ReactNode, type Ref } from "react";
import { formatStatusTimestamp, useLiveClock } from "./desktopStatus";
import {
  clampIconOffset,
  clampWindowRect,
  desktopPoint,
  desktopScale,
  iconBaseRects,
  localRect,
  maximizedWindowRect,
  moveWindowRect,
  type DesktopBounds,
  type IconOffset,
  type LocalRect,
  type WindowRect,
} from "./desktopDrag";
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
  outsideHover?: boolean;
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

type WindowFrame = {
  appId: string;
  rect: WindowRect;
  maximized: boolean;
  restoreRect: WindowRect | null;
};

type WindowDragState = {
  appId: string;
  pointerId: number;
  startX: number;
  startY: number;
  origin: WindowRect;
  scale: number;
  bounds: DesktopBounds;
  moved: boolean;
};

type WindowDragHandlers = {
  onPointerDown?: PointerEventHandler<HTMLElement>;
  onPointerMove?: PointerEventHandler<HTMLElement>;
  onPointerUp?: PointerEventHandler<HTMLElement>;
  onPointerCancel?: PointerEventHandler<HTMLElement>;
  onLostPointerCapture?: PointerEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
};

/** Counts an activation on an icon and reports whether it completes a double activation. */
function registerActivation(previous: Activation | null, id: string): { state: Activation | null; doubled: boolean } {
  const now = Date.now();
  const doubled = previous !== null && previous.id === id && now - previous.at <= DOUBLE_ACTIVATION_MS;
  return { state: doubled ? null : { id, at: now }, doubled };
}

export function DesktopWindow({
  title,
  onClose,
  children,
  geometry = null,
  maximized = false,
  moving = false,
  dragging = false,
  onToggleMaximize,
  onToggleMove,
  dragHandle,
  windowRef,
  moveButtonRef,
}: {
  title: string;
  onClose: () => void;
  children?: ReactNode;
  /** The local rectangle of the window; without it the CSS default placement is used. */
  geometry?: WindowRect | null;
  maximized?: boolean;
  moving?: boolean;
  dragging?: boolean;
  onToggleMaximize?: () => void;
  onToggleMove?: () => void;
  dragHandle?: WindowDragHandlers;
  windowRef?: Ref<HTMLElement>;
  moveButtonRef?: Ref<HTMLButtonElement>;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => { closeButton.current?.focus(); }, []);

  return (
    <section
      ref={windowRef}
      className={styles.window}
      aria-labelledby="monitor-window-title"
      data-maximized={maximized ? "true" : undefined}
      data-moving={moving ? "true" : undefined}
      style={geometry ? {
        left: geometry.x,
        top: geometry.y,
        width: geometry.width,
        height: geometry.height,
        right: "auto",
        bottom: "auto",
      } : undefined}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        onClose();
      }}
    >
      <header
        className={styles.windowBar}
        role="group"
        tabIndex={0}
        aria-label={`${title} window title bar`}
        aria-describedby="monitor-window-move-hint"
        data-dragging={dragging ? "true" : undefined}
        {...dragHandle}
      >
        <span className={styles.windowTitle} id="monitor-window-title">{title}</span>
        <div className={styles.windowActions}>
          <button
            ref={moveButtonRef}
            type="button"
            className={styles.windowControl}
            onClick={onToggleMove}
            disabled={maximized || !onToggleMove}
            aria-label="Move window"
            aria-pressed={moving}
          >Move</button>
          <button
            type="button"
            className={styles.windowControl}
            onClick={onToggleMaximize}
            disabled={!onToggleMaximize}
            aria-label={maximized ? "Restore window" : "Maximize window"}
          >{maximized ? "Restore" : "Maximize"}</button>
          <button ref={closeButton} type="button" className={styles.windowControl} onClick={onClose}>Close</button>
        </div>
      </header>
      <p id="monitor-window-move-hint" className={styles.visuallyHidden}>
        {maximized
          ? "This window is maximized. Choose Restore window to move or place it."
          : "Use the arrow keys to move this window. Choose Move window to place it with the pointer."}
      </p>
      {moving && (
        <p className={styles.visuallyHidden} role="status">
          Move the {title} window. Click or tap where it should go. Press Escape to cancel.
        </p>
      )}
      <div
        className={styles.windowBody}
        role="group"
        aria-label={`${title} content`}
        tabIndex={0}
        inert={moving}
      >{children}</div>
    </section>
  );
}

export default function MonitorDesktop({
  apps = [],
  active = true,
  outsideHover = false,
  openAppId = null,
  onOpenAppChange,
  onExit,
  ref,
}: MonitorDesktopProps) {
  const [offsets, setOffsets] = useState<Record<string, IconOffset>>({});
  const [selectedAppId, setSelectedAppId] = useState<string | null>(openAppId);
  const [previousOpenAppId, setPreviousOpenAppId] = useState(openAppId);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [windowFrame, setWindowFrame] = useState<WindowFrame | null>(null);
  const [windowBounds, setWindowBounds] = useState<DesktopBounds>({ width: 0, height: 0, top: 0 });
  const [movingAppId, setMovingAppId] = useState<string | null>(null);
  const [draggingWindow, setDraggingWindow] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const lastActivation = useRef<Activation | null>(null);
  const drag = useRef<DragState | null>(null);
  const draggedClick = useRef(false);
  const desktopElement = useRef<HTMLDivElement | null>(null);
  const iconList = useRef<HTMLUListElement | null>(null);
  const statusBar = useRef<HTMLElement | null>(null);
  const windowElement = useRef<HTMLElement | null>(null);
  const moveButton = useRef<HTMLButtonElement | null>(null);
  const windowDrag = useRef<WindowDragState | null>(null);
  const openApp = apps.find((app) => app.id === openAppId) ?? null;
  if (openAppId !== previousOpenAppId) {
    setPreviousOpenAppId(openAppId);
    if (openAppId) setSelectedAppId(openAppId);
  }
  // An owning app id makes the transient mode self-cancel if the room closes or replaces its
  // window, without leaving the icons inert and the placement layer unreachable.
  const moving = openApp !== null && movingAppId === openApp.id;
  const activeFrame = openApp && windowFrame?.appId === openApp.id ? windowFrame : null;
  const maximized = activeFrame?.maximized ?? false;
  const displayRect = activeFrame
    ? activeFrame.maximized
      ? maximizedWindowRect(windowBounds)
      : clampWindowRect(activeFrame.rect, windowBounds)
    : null;

  /** The space a window may use, read from the same projected desktop that contains it. */
  const readBounds = (): DesktopBounds => ({
    width: desktopElement.current?.offsetWidth ?? 0,
    height: desktopElement.current?.offsetHeight ?? 0,
    top: statusBar.current?.offsetHeight ?? 0,
  });

  const readWindowRect = (desktop: HTMLElement, element: HTMLElement, bounds: DesktopBounds) =>
    clampWindowRect(localRect(desktop, element), bounds);

  /** Drops a pending activation, so only a real second activation of the same icon opens a file. */
  const clearActivation = () => {
    lastActivation.current = null;
  };

  /** Ends any pointer gesture and closes the transient move mode of the shared window. */
  const clearWindowInteraction = () => {
    windowDrag.current = null;
    setDraggingWindow(false);
    setMovingAppId(null);
  };

  const closeWindow = () => {
    clearActivation();
    clearWindowInteraction();
    setWindowFrame(null);
    onOpenAppChange?.(null);
    opener.current?.focus();
  };

  const showApp = (app: DesktopApp, trigger: HTMLButtonElement) => {
    clearActivation();
    setSelectedAppId(app.id);
    clearWindowInteraction();
    // A different app starts at the default place. Reactivating the app that already owns the
    // window keeps the user's geometry, including its maximized state.
    setWindowFrame((current) => (
      openAppId === app.id && current?.appId === app.id ? current : null
    ));
    opener.current = trigger;
    onOpenAppChange?.(app.id);
  };

  /** Counts a double activation on the same icon, so a single click or tap only selects the file. */
  const countDoubleActivation = (app: DesktopApp, trigger: HTMLButtonElement) => {
    setSelectedAppId(app.id);
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

  /** Starts a window drag only from the free part of its title bar. */
  const startWindowDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (!openApp || maximized || moving) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const target = event.target;
    if (target instanceof Element && target.closest("button, a, input, textarea, select, iframe, [contenteditable='true']")) return;
    const desktop = desktopElement.current;
    const element = windowElement.current;
    if (!desktop || !element) return;

    const bounds = readBounds();
    windowDrag.current = {
      appId: openApp.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: readWindowRect(desktop, element, bounds),
      scale: desktopScale(desktop),
      bounds,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
  };

  /** Moves the window by the pointer delta and clamps it to the projected workspace. */
  const moveWindowDrag = (event: React.PointerEvent<HTMLElement>) => {
    const state = windowDrag.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const dx = (event.clientX - state.startX) / state.scale;
    const dy = (event.clientY - state.startY) / state.scale;
    if (!state.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    state.moved = true;
    setDraggingWindow(true);
    setWindowFrame({
      appId: state.appId,
      rect: moveWindowRect(state.origin, dx, dy, state.bounds),
      maximized: false,
      restoreRect: null,
    });
  };

  /** Ends a title-bar drag, including a pointer released outside the title bar. */
  const endWindowDrag = (event: React.PointerEvent<HTMLElement>) => {
    const state = windowDrag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    windowDrag.current = null;
    setDraggingWindow(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const loseWindowDrag = () => {
    if (!windowDrag.current) return;
    windowDrag.current = null;
    setDraggingWindow(false);
  };

  /** Arrow keys move a normal window only while the title bar itself has focus. */
  const moveWindowWithKeyboard = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    const step = 8;
    let dx = 0;
    let dy = 0;
    if (event.key === "ArrowLeft") dx = -step;
    else if (event.key === "ArrowRight") dx = step;
    else if (event.key === "ArrowUp") dy = -step;
    else if (event.key === "ArrowDown") dy = step;
    else return;

    event.preventDefault();
    if (!openApp || maximized) return;
    const desktop = desktopElement.current;
    const element = windowElement.current;
    if (!desktop || !element) return;

    const bounds = readBounds();
    setWindowBounds(bounds);
    setWindowFrame({
      appId: openApp.id,
      rect: moveWindowRect(readWindowRect(desktop, element, bounds), dx, dy, bounds),
      maximized: false,
      restoreRect: null,
    });
  };

  /** Maximizes the current window below the status bar, or restores its previous geometry. */
  const toggleMaximize = () => {
    if (!openApp) return;
    const bounds = readBounds();
    setWindowBounds(bounds);
    windowDrag.current = null;
    setDraggingWindow(false);
    setMovingAppId(null);

    if (activeFrame?.maximized) {
      const rect = clampWindowRect(activeFrame.restoreRect ?? activeFrame.rect, bounds);
      setWindowFrame({ appId: openApp.id, rect, maximized: false, restoreRect: null });
      return;
    }

    const desktop = desktopElement.current;
    const element = windowElement.current;
    if (!desktop || !element) return;
    const rect = readWindowRect(desktop, element, bounds);
    setWindowFrame({ appId: openApp.id, rect, maximized: true, restoreRect: rect });
  };

  /** Toggles the pointer placement mode without moving the window yet. */
  const toggleMove = () => {
    if (!openApp || maximized) return;
    windowDrag.current = null;
    setDraggingWindow(false);
    setMovingAppId((current) => (current === openApp.id ? null : openApp.id));
  };

  /** Places the window's top-left corner at the tapped point, then clamps it to the workspace. */
  const placeWindow = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!openApp) return;
    const desktop = desktopElement.current;
    const element = windowElement.current;
    if (!desktop || !element) return;

    const bounds = readBounds();
    const point = desktopPoint(desktop, event.clientX, event.clientY);
    const rect = readWindowRect(desktop, element, bounds);
    setWindowBounds(bounds);
    setWindowFrame({
      appId: openApp.id,
      rect: clampWindowRect({ ...rect, x: point.x, y: point.y }, bounds),
      maximized: false,
      restoreRect: null,
    });
    setMovingAppId(null);
    moveButton.current?.focus({ preventScroll: true });
  };

  // The projected size of the desktop follows the viewport, so an offset that was valid before a
  // resize can leave the screen. Every stored offset is clamped again whenever the desktop is
  // laid out anew.
  useEffect(() => {
    const desktop = desktopElement.current;
    const list = iconList.current;
    if (!desktop || !list) return;

    const applyBounds = () => {
      const bounds = {
        width: desktop.offsetWidth,
        height: desktop.offsetHeight,
        top: statusBar.current?.offsetHeight ?? 0,
      };

      setWindowBounds((current) => (
        current.width === bounds.width && current.height === bounds.height && current.top === bounds.top
          ? current
          : bounds
      ));
      setOffsets((current) => {
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
      // The stored rectangle is the user's intended geometry; the render clamps it to the current
      // desktop. Keeping the intended size lets the window recover after a temporary small viewport.
    };

    const observer = new ResizeObserver(applyBounds);
    observer.observe(desktop);
    if (statusBar.current) observer.observe(statusBar.current);
    applyBounds();
    return () => observer.disconnect();
  }, []);

  // Move mode is a transient pointer mode. Catch Escape before the window's own close handler so
  // cancelling the move cannot accidentally close the app.
  useEffect(() => {
    if (!moving) return;

    const cancel = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setMovingAppId(null);
      moveButton.current?.focus({ preventScroll: true });
    };
    const leaveDesktopOnPointer = (event: PointerEvent) => {
      const desktop = desktopElement.current;
      if (desktop && event.target instanceof Node && desktop.contains(event.target)) return;
      setMovingAppId(null);
    };
    // A delayed focus event from a tap can land on the document body; only an outside focusable
    // target (the keyboard path out of the desktop) should cancel placement.
    const leaveDesktopOnFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const desktop = desktopElement.current;
      if (desktop?.contains(target)) return;
      if (!target.closest("a[href], button, input, select, textarea, iframe, summary, [tabindex]")) return;
      setMovingAppId(null);
    };

    document.addEventListener("keydown", cancel, true);
    document.addEventListener("pointerdown", leaveDesktopOnPointer, true);
    document.addEventListener("focusin", leaveDesktopOnFocus, true);
    return () => {
      document.removeEventListener("keydown", cancel, true);
      document.removeEventListener("pointerdown", leaveDesktopOnPointer, true);
      document.removeEventListener("focusin", leaveDesktopOnFocus, true);
    };
  }, [moving]);

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
      data-outside-hover={outsideHover ? "true" : undefined}
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
        // Move mode consumes Escape; closing the window would discard the geometry the user is
        // still placing.
        if (moving) {
          setMovingAppId(null);
          moveButton.current?.focus({ preventScroll: true });
          return;
        }
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
      <ul className={styles.icons} ref={iconList} inert={moving}>
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
                data-selected={selectedAppId === app.id ? "true" : undefined}
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
        <DesktopWindow
          key={openApp.id}
          title={openApp.title}
          onClose={closeWindow}
          geometry={displayRect}
          maximized={maximized}
          moving={moving}
          dragging={draggingWindow}
          onToggleMaximize={toggleMaximize}
          onToggleMove={toggleMove}
          windowRef={windowElement}
          moveButtonRef={moveButton}
          dragHandle={{
            onPointerDown: startWindowDrag,
            onPointerMove: moveWindowDrag,
            onPointerUp: endWindowDrag,
            onPointerCancel: endWindowDrag,
            onLostPointerCapture: loseWindowDrag,
            onKeyDown: moveWindowWithKeyboard,
          }}
        >
          {openApp.content}
        </DesktopWindow>
      )}
      {moving && (
        <div
          className={styles.moveLayer}
          aria-hidden="true"
          onClick={placeWindow}
        />
      )}
    </div>
  );
}
