import { portfolioContent } from "./content";

export default function OwnerContent() {
  return (<>
    <p className="intro__eyebrow">Portfolio</p>
    <h1 id="name">{portfolioContent.owner.name}</h1>
    <p className="intro__role">{portfolioContent.owner.role}</p>

    <section className="experience" aria-labelledby="experience-heading">
      <h2 id="experience-heading">Experience</h2>
      <ul>
        {portfolioContent.owner.experience.map((role) => (
          <li key={`${role.company}-${role.title}-${role.period}`}>
            <h3>{role.title}</h3>
            <p>
              {role.company} · {role.period}
            </p>
          </li>
        ))}
      </ul>
    </section>
  </>);
}
