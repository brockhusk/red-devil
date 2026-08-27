import Nav from './components/Nav'
import Hero from './components/Hero'
import Inbox from './components/Inbox'
import Projects from './components/Projects'
import Footer from './components/Footer'
import Admin from './components/Admin'
import './App.css'

export default function App() {
  // Minimal client side routing. The app has exactly two views, so a router
  // dependency would cost more than it gives. Nginx already serves index.html
  // for unknown paths via `try_files $uri $uri/ /index.html`, so a direct visit
  // or hard refresh on /admin loads the bundle and lands here.
  if (window.location.pathname.replace(/\/$/, '') === '/admin') {
    return <Admin />
  }

  return (
    <>
      <Nav />
      <main className="main">
        <Hero />
        <Inbox />
        <Projects />
      </main>
      <Footer />
    </>
  )
}
