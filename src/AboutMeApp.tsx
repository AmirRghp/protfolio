import { portfolioContent } from "./content";
import styles from "./AboutMeApp.module.css";

/** The document glyph of the `about-me.txt` icon, matching the desktop file reference. */
export function AboutMeFileIcon() {
  return (
    <svg className={styles.fileIcon} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M7 3.5h11.5L25 10v18.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" fill="#eef4f7" />
      <path d="M18.5 3.5 25 10h-6.5V3.5z" fill="#b9cdd7" />
      <g fill="#7c98a6">
        <rect x="9.5" y="13" width="13" height="1.7" rx="0.85" />
        <rect x="9.5" y="16.6" width="13" height="1.7" rx="0.85" />
        <rect x="9.5" y="20.2" width="9" height="1.7" rx="0.85" />
      </g>
    </svg>
  );
}

/** The text of `about-me.txt`, read from the shared portfolio content. */
export default function AboutMeApp() {
  const owner = portfolioContent.owner;

  return (
    <article className={styles.document} aria-labelledby="about-me-heading">
      <h2 id="about-me-heading" className={styles.heading}>About me</h2>
      <p className={styles.name}>{owner.name}</p>
      <p className={styles.role}>{owner.role}</p>

      <h3 className={styles.heading}>Experience</h3>
      <ul className={styles.experience}>
        {owner.experience.map((role) => (
          <li key={`${role.company}-${role.title}-${role.period}`}>
            <p className={styles.entry}>{role.title} · {role.company}</p>
            <p className={styles.meta}>{role.period}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
