import CurrentlyPanel from './Currently'

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="shell">
        <div className="hero-inner">
          <div className="hero-intro">
            <div className="hero-identity">
              <img src="/headshot.png" alt="Brock Huskisson" className="hero-photo" />
              <div className="hero-text">
                <h1 className="hero-name">Brock Huskisson</h1>
                <p className="hero-tagline">
                  Part engineer, part salesperson. I prove the software works before anyone signs anything.
                </p>
              </div>
            </div>
          </div>
          <CurrentlyPanel />
        </div>
      </div>
    </section>
  )
}
