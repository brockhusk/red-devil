const projects = [
  {
    id: 1,
    title: 'brockhusk.com',
    description: 'This site. A personal hub built with Vite + React, plain CSS, no UI frameworks.',
    url: '#',
    status: 'Active',
  },
  {
    id: 2,
    title: 'Logbook',
    description: 'A minimal daily journaling app with local-first storage and a distraction-free editor.',
    url: '#',
    status: 'In progress',
  },
  {
    id: 3,
    title: 'Timelapse CLI',
    description: 'A command-line tool that captures periodic screenshots and stitches them into a timelapse video.',
    url: '#',
    status: 'Complete',
  },
  {
    id: 4,
    title: 'Readlist',
    description: 'A lightweight reading tracker that syncs across devices via a small REST API.',
    url: '#',
    status: 'Archived',
  },
]

function statusClass(status) {
  return `project-badge status-${status.toLowerCase().replace(' ', '-')}`
}

export default function Projects() {
  return (
    <section id="projects" className="section-projects">
      <div className="shell section-projects-inner">
        <h2 className="label-upper section-label">Projects</h2>
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
