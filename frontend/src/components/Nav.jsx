const links = [
  { href: '#hero', label: 'Home' },
  { href: '#inbox', label: 'Inbox' },
  { href: '#projects', label: 'Projects' },
]

export default function Nav() {
  return (
    <header className="site-header">
      <nav className="nav nav-inner" aria-label="Primary">
        <a href="#hero" className="nav-brand">brockhusk</a>
        <ul className="nav-links">
          {links.map(({ href, label }) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
