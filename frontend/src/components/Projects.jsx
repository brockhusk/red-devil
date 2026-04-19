import { useState } from 'react'

const projects = [
  {
    id: 1,
    title: 'brockhusk.com',
    description:
      'Personal hub site built on a physical server in my house. React, FastAPI, PostgreSQL, Nginx, Datadog.',
    status: 'Active',
    github: 'https://github.com/brockhusk/red-devil',
    stack: ['React', 'FastAPI', 'PostgreSQL', 'Nginx', 'Cloudflare', 'Datadog'],
    detail:
      'Full stack personal hub site built on a physical home server. Covers the entire lifecycle from Linux server setup to React frontend, FastAPI backend, PostgreSQL database, and production deployment with Nginx and Cloudflare.',
  },
  {
    id: 2,
    title: 'Red Devil Server',
    description:
      'Ubuntu 24.04 home server running this site. Building out the full stack and using it as a hands-on learning project.',
    status: 'In Progress',
    github: 'https://github.com/brockhusk/red-devil',
    stack: ['Ubuntu', 'Nginx', 'PostgreSQL', 'Datadog'],
    detail:
      'Ubuntu 24.04 LTS home server running brockhusk.com end to end. Built as a hands-on learning project covering Linux system administration, networking, server configuration, and Datadog monitoring.',
  },
]

const brandColors = {
  React:      { bg: '#61DAFB', fg: '#000' },
  FastAPI:    { bg: '#009688', fg: '#fff' },
  PostgreSQL: { bg: '#336791', fg: '#fff' },
  Nginx:      { bg: '#009900', fg: '#fff' },
  Cloudflare: { bg: '#F6821F', fg: '#fff' },
  Datadog:    { bg: '#632CA6', fg: '#fff' },
  Ubuntu:     { bg: '#E95420', fg: '#fff' },
  Python:     { bg: '#3776AB', fg: '#fff' },
}

function statusClass(status) {
  return `project-badge status-${status.toLowerCase().replace(' ', '-')}`
}

export default function Projects() {
  const [expandedId, setExpandedId] = useState(null)

  function toggle(id) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <section id="projects" className="section-projects">
      <div className="shell">
        <h2 className="section-kicker">Projects</h2>
        <div className="projects-grid">
          {projects.map((project) => {
            const isOpen = expandedId === project.id
            return (
              <div
                key={project.id}
                className={`project-card${isOpen ? ' project-card--expanded' : ''}`}
                onClick={() => toggle(project.id)}
              >
                <div className="project-header">
                  <span className={statusClass(project.status)}>{project.status}</span>
                  <span className={`project-chevron${isOpen ? ' project-chevron--open' : ''}`}>
                    ▾
                  </span>
                </div>
                <span className="project-title">{project.title}</span>
                <p className="project-description">{project.description}</p>
                {isOpen && (
                  <div className="project-detail">
                    <p className="project-detail-text">{project.detail}</p>
                    <div className="project-stack">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="project-stack-tag"
                          style={{
                            background: (brandColors[tech] || { bg: '#1E7A56' }).bg,
                            color: (brandColors[tech] || { fg: '#fff' }).fg,
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <a
                      href={project.github}
                      className="project-github"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View on GitHub
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
