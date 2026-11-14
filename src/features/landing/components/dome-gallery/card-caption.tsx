import { type RefObject } from "react";
import { type DomeProject, formatMeta } from "./dome";
import styles from "./DomeGallery.module.css";

type CardCaptionProps = {
  project: DomeProject;
  captionRef?: RefObject<HTMLDivElement | null>;
  id?: string;
};

export function CardCaption({ project, captionRef, id }: CardCaptionProps) {
  return (
    <div id={id} ref={captionRef} className={styles.cardCaption}>
      <span data-title className={styles.captionTitle}>
        {project.title}
      </span>
      <span data-meta className={styles.captionMeta}>
        {formatMeta(project)}
      </span>
    </div>
  );
}
