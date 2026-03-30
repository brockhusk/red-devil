const projects = [
  {
    id: 1,
    title: 'brockhusk.com',
    description:
      'Personal hub site built on a physical server in my house. React, FastAPI, PostgreSQL, Nginx, Datadog.',
    url: '#',
    status: 'Active',
  },
  {
    id: 2,
    title: 'Red Devil Server',
    description:
      'Ubuntu 24.04 home server running this site. Building out the full stack and using it as a hands-on learning project.',
    url: '#',
    status: 'In Progress',
  },
]

function statusClass(status) {
  return `project-badge status-${status.toLowerCase().replace(' ', '-')}`
}

export default function Projects() {
  return (
    <section id="projects" className="section-projects">
      <div className="shell">
        <h2 className="section-kicker">Projects</h2>
        <div className="projects-grid">
          {projects.map((project) => (
            <a key={project.id} href={project.url} className="project-card">
              <span className={statusClass(project.status)}>{project.status}</span>
              <span className="project-title">{project.title}</span>
              <p className="project-description">{project.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
