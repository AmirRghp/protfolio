import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { formatStatusTimestamp, useLiveClock } from "./desktopStatus";
import GradientWaves from "./GradientWaves";
import styles from "./MonitorDesktop.module.css";

export type DesktopApp = {
  id: string;
  label: string;
  title: string;
  icon: ReactNode;
  content: ReactNode;
};

type MonitorDesktopProps = {
  apps?: DesktopApp[];
  /** The desktop is only interactive while the monitor is focused. */
  active?: boolean;
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

function StatusBar() {
  const now = useLiveClock();
  const timestamp = formatStatusTimestamp(now);

  return (
    <header className={styles.statusBar}>
      <span className={styles.workspace}>Amirreza Workspace</span>
      <span className={styles.statusMeta}>
        <WifiIcon />
        <VolumeIcon />
        <time className={styles.clock} dateTime={timestamp.iso}>{timestamp.label}</time>
      </span>
    </header>
  );
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
      <div className={styles.windowBody}>{children}</div>
    </section>
  );
}

export default function MonitorDesktop({ apps = [], active = true, onExit, ref }: MonitorDesktopProps) {
  const [openAppId, setOpenAppId] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const openApp = apps.find((app) => app.id === openAppId) ?? null;

  const closeWindow = () => {
    setOpenAppId(null);
    opener.current?.focus();
  };

  return (
    <div
      className={styles.desktop}
      ref={ref}
      tabIndex={-1}
      role="region"
      aria-label="Amirreza workspace"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || openApp) return;
        event.stopPropagation();
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
      <StatusBar />
      <ul className={styles.icons}>
        {apps.map((app) => (
          <li key={app.id}>
            <button
              type="button"
              className={styles.icon}
              onClick={(event) => {
                opener.current = event.currentTarget;
                setOpenAppId(app.id);
              }}
            >
              <span className={styles.iconTile} aria-hidden="true">{app.icon}</span>
              <span className={styles.iconLabel}>{app.label}</span>
            </button>
          </li>
        ))}
      </ul>
      {openApp && (
        <DesktopWindow title={openApp.title} onClose={closeWindow}>
          {openApp.content}
        </DesktopWindow>
      )}
    </div>
  );
}
