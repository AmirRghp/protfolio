import { portfolioContent } from "./content";

export default function App() {
  return (
    <main className="intro" aria-labelledby="name">
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

      <section className="projects" aria-labelledby="projects-heading">
        <h2 id="projects-heading">Selected projects</h2>
        <ul>
          {portfolioContent.projects.map((project) => (
            <li className="project" key={project.id}>
              <h3>{project.title}</h3>
              <p>{project.brief}</p>
              <a href={project.githubUrl} aria-label={`View ${project.title} on GitHub`}>
                View on GitHub
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
