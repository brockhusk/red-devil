import CurrentlyPanel from './Currently'

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="shell hero-inner">
        <div className="hero-intro">
          <h1 className="hero-name">Brock Huskisson</h1>
          <p className="hero-tagline">
            Part engineer, part salesperson. I prove the software works before anyone signs anything.
          </p>
        </div>
        <CurrentlyPanel />
      </div>
    </section>
  )
}
