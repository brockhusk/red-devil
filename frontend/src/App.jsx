import Nav from './components/Nav'
import Hero from './components/Hero'
import Inbox from './components/Inbox'
import Projects from './components/Projects'
import './App.css'

export default function App() {
  return (
    <>
      <Nav />
      <main className="main">
        <Hero />
        <Inbox />
        <Projects />
      </main>
    </>
  )
}
