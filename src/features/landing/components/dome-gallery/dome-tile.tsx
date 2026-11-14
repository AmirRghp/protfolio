import { useEffect, useRef } from "react";
import { CardCaption } from "./card-caption";
import { type DomeLayout, type DomeProject } from "./dome";
import styles from "./DomeGallery.module.css";

export type CellSlot = { col: number; row: number; key: string };

type DomeTileProps = {
  slot: CellSlot;
  layout: DomeLayout;
  initialProject: DomeProject;
  isHidden: boolean;
  registerTile: (slotKey: string, el: HTMLButtonElement | null) => void;
  onSelect: (slot: CellSlot, el: HTMLButtonElement) => void;
};

export function DomeTile({
  slot,
  layout,
  initialProject,
  isHidden,
  registerTile,
  onSelect,
}: DomeTileProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = btnRef.current;
    registerTile(slot.key, el);
    return () => {
      registerTile(slot.key, null);
    };
  }, [slot.key, registerTile]);

  return (
    <button
      ref={btnRef}
      type="button"
      data-slot={slot.key}
      data-project-id={initialProject.id}
      aria-label={`${initialProject.title} — ${initialProject.category} (${initialProject.year})`}
      onClick={(e) => onSelect(slot, e.currentTarget)}
      className={styles.tileButton}
      style={{
        width: layout.cardWidth,
        height: layout.cardHeight,
        marginLeft: -layout.cardWidth / 2,
        marginTop: -layout.cardHeight / 2,
        opacity: isHidden ? 0 : 1,
        pointerEvents: isHidden ? "none" : undefined,
      }}
    >
      <div data-frame className={styles.tileFrame}>
        <img
          src={initialProject.image}
          alt={initialProject.alt}
          draggable={false}
          decoding="async"
          className={styles.tileImage}
        />
        <div data-stack className={styles.tileStackPreview} aria-hidden="true">
          {initialProject.techStack.slice(0, 3).map((tech) => (
            <span key={tech} className={styles.tileStackChip}>
              {tech}
            </span>
          ))}
        </div>
        <div data-shade className={styles.tileShade} />
      </div>
      <CardCaption project={initialProject} />
    </button>
  );
}
