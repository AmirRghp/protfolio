import { portfolioContent } from "./content";

export default function OwnerContent({ panel = false }: { panel?: boolean }) {
  const prefix = panel ? "monitor-" : "";
  return (<>
        <p className="intro__eyebrow">Portfolio</p>
        {panel ? <h3>{portfolioContent.owner.name}</h3> : <h1 id="name">{portfolioContent.owner.name}</h1>}
        <p className="intro__role">{portfolioContent.owner.role}</p>

        <section className="experience" aria-labelledby={`${prefix}experience-heading`}>
          {panel ? <h3 id={`${prefix}experience-heading`}>Experience</h3> : <h2 id="experience-heading">Experience</h2>}
          <ul>
            {portfolioContent.owner.experience.map((role) => (
              <li key={`${role.company}-${role.title}-${role.period}`}>
                {panel ? <h4>{role.title}</h4> : <h3>{role.title}</h3>}
                <p>
                  {role.company} · {role.period}
                </p>
              </li>
            ))}
          </ul>
        </section>

  </>);
}
