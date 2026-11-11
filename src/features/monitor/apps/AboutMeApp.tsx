import { useState } from "react";
import { portfolioContent } from "@/data/content";
import styles from "./AboutMeApp.module.css";

type SectionTab = "all" | "experience" | "skills" | "projects";

const SECTION_TABS: { id: SectionTab; label: string }[] = [
  { id: "all", label: "Full Portfolio" },
  { id: "experience", label: "Experience & Education" },
  { id: "skills", label: "Skills & Stack" },
  { id: "projects", label: "Projects & Courses" },
];

/** The document glyph of the `about-me.txt` icon, matching the desktop file reference. */
export function AboutMeFileIcon() {
  return (
    <svg className={styles.fileIcon} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M7 3.5h11.5L25 10v18.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" fill="#eef4f7" />
      <path d="M18.5 3.5 25 10h-6.5V3.5z" fill="#b9cdd7" />
      <circle cx="13" cy="12.5" r="2.2" fill="#38bdf8" />
      <g fill="#5b7a8c">
        <rect x="9.5" y="16.8" width="13" height="1.6" rx="0.8" />
        <rect x="9.5" y="20.2" width="13" height="1.6" rx="0.8" />
        <rect x="9.5" y="23.6" width="8.5" height="1.6" rx="0.8" />
      </g>
    </svg>
  );
}

/** The interactive portfolio view of `about-me.txt`, populated with the owner's resume details. */
export default function AboutMeApp() {
  const { owner, projects } = portfolioContent;
  const [activeTab, setActiveTab] = useState<SectionTab>("all");

  const showExperience = activeTab === "all" || activeTab === "experience";
  const showSkills = activeTab === "all" || activeTab === "skills";
  const showProjects = activeTab === "all" || activeTab === "projects";

  return (
    <article className={styles.portfolio} aria-labelledby="about-me-heading">
      {/* Top Editorial Hero Banner */}
      <header className={styles.hero}>
        <div className={styles.heroMain}>
          <div className={styles.kickerRow}>
            <h2 id="about-me-heading" className={styles.kicker}>About me</h2>
            <span className={styles.separator} aria-hidden="true">·</span>
            <span className={styles.locationText}>{owner.location}</span>
          </div>

          <p className={styles.name}>{owner.name}</p>

          <div className={styles.roleRow}>
            <p className={styles.role}>{owner.role}</p>
            <span className={styles.separator} aria-hidden="true">·</span>
            <p className={styles.headline}>{owner.headline}</p>
          </div>

          <p className={styles.bio}>{owner.bio}</p>

          <div className={styles.contactRow}>
            <a href={`mailto:${owner.email}`} className={styles.contactLink}>
              {owner.email}
            </a>
            <span className={styles.separator} aria-hidden="true">·</span>
            <a href={`tel:${owner.phone}`} className={styles.contactLink}>
              {owner.phone}
            </a>
            <span className={styles.separator} aria-hidden="true">·</span>
            <span className={styles.languageText}>
              {owner.languages.map((l) => `${l.language} (${l.proficiency})`).join(" / ")}
            </span>
          </div>
        </div>

        <div className={styles.heroActions}>
          <a
            href={owner.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryAction}
          >
            GitHub Profile
          </a>
        </div>
      </header>

      {/* Key Metrics Strip */}
      <div className={styles.metricsStrip} aria-label="Career highlights">
        {owner.metrics.map((metric) => (
          <div key={metric.label} className={styles.metricItem}>
            <span className={styles.metricValue}>{metric.value}</span>
            <span className={styles.metricLabel}>{metric.label}</span>
          </div>
        ))}
      </div>

      {/* Interactive Section Filter Bar */}
      <nav className={styles.filterBar} aria-label="Portfolio sections">
        {SECTION_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={styles.filterButton}
            data-active={activeTab === tab.id ? "true" : undefined}
            aria-pressed={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Work Experience & Education */}
      {showExperience && (
        <div className={styles.twoColGrid}>
          <section className={styles.section} aria-labelledby="about-experience-heading">
            <div className={styles.sectionHeader}>
              <h3 id="about-experience-heading" className={styles.sectionTitle}>
                01. Experience
              </h3>
              <span className={styles.sectionMeta}>1+ Year Industry Track</span>
            </div>

            <ul className={styles.timelineList}>
              {owner.experience.map((role) => (
                <li
                  key={`${role.company}-${role.title}-${role.period}`}
                  className={styles.timelineCard}
                >
                  <div className={styles.cardHeader}>
                    <p className={styles.entryTitle}>
                      {role.title ? `${role.title} · ${role.company}` : role.company}
                    </p>
                    <p className={styles.entryPeriod}>{role.period}</p>
                  </div>
                  <p className={styles.entrySubmeta}>
                    {[role.roleNote, role.companyNote, role.location]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <ul className={styles.highlightList}>
                    {role.highlights.map((item) => (
                      <li key={item} className={styles.highlightItem}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          <div className={styles.stackColumn}>
            <section className={styles.section} aria-labelledby="about-education-heading">
              <div className={styles.sectionHeader}>
                <h3 id="about-education-heading" className={styles.sectionTitle}>
                  02. Education
                </h3>
                <span className={styles.sectionMeta}>Academic Background</span>
              </div>

              <ul className={styles.timelineList}>
                {owner.education.map((edu) => (
                  <li key={`${edu.degree}-${edu.field}`} className={styles.timelineCard}>
                    <div className={styles.cardHeader}>
                      <p className={styles.entryTitle}>
                        {edu.degree}: {edu.field}
                      </p>
                      <p className={styles.entryPeriod}>{edu.period}</p>
                    </div>
                    <p className={styles.entrySubmeta}>{edu.institution}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.section} aria-labelledby="about-volunteer-heading">
              <div className={styles.sectionHeader}>
                <h3 id="about-volunteer-heading" className={styles.sectionTitle}>
                  03. Leadership & Community
                </h3>
              </div>

              <ul className={styles.timelineList}>
                {owner.volunteer.map((item) => (
                  <li key={item.organization} className={styles.timelineCard}>
                    <div className={styles.cardHeader}>
                      <p className={styles.entryTitle}>{item.role}</p>
                      <p className={styles.entryPeriod}>{item.year}</p>
                    </div>
                    <p className={styles.entrySubmeta}>{item.organization}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}

      {/* Technical Skills & Software */}
      {showSkills && (
        <section className={styles.section} aria-labelledby="about-skills-heading">
          <div className={styles.sectionHeader}>
            <h3 id="about-skills-heading" className={styles.sectionTitle}>
              04. Technical Skills & Software Stack
            </h3>
            <span className={styles.sectionMeta}>AI · Backend · Product Analytics</span>
          </div>

          <div className={styles.skillsGrid}>
            {owner.skillGroups.map((group) => (
              <div key={group.category} className={styles.skillCard}>
                <h4 className={styles.skillCategory}>{group.category}</h4>
                <p className={styles.skillInlineList}>
                  {group.skills.map((skill, idx) => (
                    <span key={skill.name}>
                      <span className={styles.skillName}>{skill.name}</span>
                      {skill.level && (
                        <span className={styles.skillLevel}> ({skill.level})</span>
                      )}
                      {idx < group.skills.length - 1 && (
                        <span className={styles.separator} aria-hidden="true"> · </span>
                      )}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured GitHub Repositories, Academic Projects & Training Courses */}
      {showProjects && (
        <>
          <section className={styles.section} aria-labelledby="about-projects-heading">
            <div className={styles.sectionHeader}>
              <h3 id="about-projects-heading" className={styles.sectionTitle}>
                05. Projects & Academic Research
              </h3>
              <span className={styles.sectionMeta}>Selected Repositories & Applied ML</span>
            </div>

            <div className={styles.projectsGrid}>
              {projects.map((project) => (
                <div key={project.id} className={styles.projectCard}>
                  <div className={styles.cardHeader}>
                    <p className={styles.entryTitle}>{project.title}</p>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.inlineRepoLink}
                    >
                      GitHub ↗
                    </a>
                  </div>
                  <p className={styles.projectBrief}>{project.brief}</p>
                  {project.highlights && (
                    <p className={styles.projectMeta}>
                      {project.highlights.join(" · ")}
                    </p>
                  )}
                </div>
              ))}

              {owner.academicProjects.map((item) => (
                <div key={item.title} className={styles.projectCard}>
                  <div className={styles.cardHeader}>
                    <p className={styles.entryTitle}>{item.title}</p>
                    <span className={styles.entryPeriod}>{item.year}</span>
                  </div>
                  <p className={styles.entrySubmeta}>{item.category}</p>
                  <p className={styles.projectBrief}>{item.summary}</p>
                </div>
              ))}
              {projects.length === 0 && owner.academicProjects.length === 0 && (
                <p className={styles.projectBrief} role="status">
                  No projects available in this view.
                </p>
              )}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="about-courses-heading">
            <div className={styles.sectionHeader}>
              <h3 id="about-courses-heading" className={styles.sectionTitle}>
                06. Specialized Training & Certifications
              </h3>
              <span className={styles.sectionMeta}>Coursera & Udemy · 2025</span>
            </div>

            <ul className={styles.coursesGrid}>
              {owner.courses.map((course) => (
                <li key={course.title} className={styles.courseCard}>
                  <p className={styles.entryTitle}>{course.title}</p>
                  <p className={styles.entrySubmeta}>
                    {course.provider} · {course.year} · {course.duration}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </article>
  );
}
