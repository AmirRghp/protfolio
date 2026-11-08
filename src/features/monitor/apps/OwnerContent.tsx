import { portfolioContent } from "./content";

export default function OwnerContent() {
  const { owner } = portfolioContent;

  return (
    <>
      <header className="intro__header">
        <p className="intro__eyebrow">Portfolio · {owner.location}</p>
        <h1 id="name">{owner.name}</h1>
        <div className="intro__identity">
          <p className="intro__role">{owner.role}</p>
          <span className="intro__dot" aria-hidden="true">·</span>
          <p className="intro__headline">{owner.headline}</p>
        </div>
        <p className="intro__bio">{owner.bio}</p>
        <p className="intro__contact">
          <span>{owner.email}</span>
          <span className="intro__dot" aria-hidden="true">·</span>
          <span>{owner.phone}</span>
          <span className="intro__dot" aria-hidden="true">·</span>
          <span>{owner.languages.map((l) => `${l.language} (${l.proficiency})`).join(" / ")}</span>
        </p>
      </header>

      <div className="intro__metrics" aria-label="Key highlights">
        {owner.metrics.map((metric) => (
          <div key={metric.label} className="intro__metric">
            <span className="intro__metric-value">{metric.value}</span>
            <span className="intro__metric-label">{metric.label}</span>
          </div>
        ))}
      </div>

      <div className="intro__grid">
        <section className="experience" aria-labelledby="experience-heading">
          <h2 id="experience-heading">Experience</h2>
          <ul>
            {owner.experience.map((role) => (
              <li key={`${role.company}-${role.title}-${role.period}`} className="experience__card">
                <div className="experience__header">
                  <h3>{role.title || role.company}</h3>
                  <p className="experience__meta">
                    {role.company} · {role.period}
                  </p>
                </div>
                <p className="experience__submeta">
                  {[role.roleNote, role.companyNote, role.location].filter(Boolean).join(" · ")}
                </p>
                <ul className="experience__highlights">
                  {role.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section className="education" aria-labelledby="education-heading">
          <h2 id="education-heading">Education & Leadership</h2>
          <ul>
            {owner.education.map((edu) => (
              <li key={`${edu.degree}-${edu.field}`} className="experience__card">
                <div className="experience__header">
                  <h3>
                    {edu.degree}: {edu.field}
                  </h3>
                  <p className="experience__meta">{edu.period}</p>
                </div>
                <p className="experience__submeta">{edu.institution}</p>
              </li>
            ))}
            {owner.volunteer.map((item) => (
              <li key={item.organization} className="experience__card">
                <div className="experience__header">
                  <h3>{item.role}</h3>
                  <p className="experience__meta">{item.year}</p>
                </div>
                <p className="experience__submeta">{item.organization}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="skills-section" aria-labelledby="skills-heading">
        <h2 id="skills-heading">Technical Skills & Software</h2>
        <div className="skills-grid">
          {owner.skillGroups.map((group) => (
            <div key={group.category} className="skill-card">
              <h3>{group.category}</h3>
              <p>
                {group.skills
                  .map((s) => (s.level ? `${s.name} (${s.level})` : s.name))
                  .join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="courses-section" aria-labelledby="courses-heading">
        <h2 id="courses-heading">Certifications & Training Courses</h2>
        <ul className="courses-grid">
          {owner.courses.map((course) => (
            <li key={course.title} className="course-card">
              <h3>{course.title}</h3>
              <p>
                {course.provider} · {course.year} · {course.duration}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
