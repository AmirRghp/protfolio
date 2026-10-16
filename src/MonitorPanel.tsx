import { useEffect, useRef, useState } from "react";
import OwnerContent from "./OwnerContent";
import styles from "./MonitorPanel.module.css";
import type { RoomDestination } from "./roomNavigation";

export default function MonitorPanel({ onNavigate }: { onNavigate: (destination: RoomDestination) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [section, setSection] = useState<"About" | "Contact">("About");

  useEffect(() => {
    const panel = dialog.current!;
    const opener = document.activeElement;
    panel.showModal();
    heading.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      panel.close();
      document.body.style.overflow = previousOverflow;
      const target = opener instanceof HTMLButtonElement ? opener : document.getElementById("destination-monitor");
      target?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => { heading.current?.focus(); }, [section]);

  return (
    <dialog ref={dialog} className={styles.panel} aria-labelledby="monitor-title"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button");
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => { event.preventDefault(); onNavigate("room"); }}>
      <header className={styles.header}>
        <h2 id="monitor-title">About Amirreza</h2>
        <button type="button" onClick={() => onNavigate("room")}>Close · Back to room</button>
      </header>
      <nav className={styles.navigation} aria-label="Monitor content">
        {(["About", "Contact"] as const).map((label) => (
          <button type="button" key={label} aria-pressed={section === label} onClick={() => {
            setSection(label);
            heading.current?.focus();
          }}>{label}</button>
        ))}
        <button type="button" onClick={() => {
          onNavigate("board");
          requestAnimationFrame(() => document.getElementById("destination-board")?.focus());
        }}>Work</button>
      </nav>
      <div className={styles.content} key={section} tabIndex={-1}>
        <h2 ref={heading} tabIndex={-1}>{section}</h2>
        {section === "About" ? <OwnerContent panel /> : <p>Contact details are not published yet.</p>}
      </div>
    </dialog>
  );
}
