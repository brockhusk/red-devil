import CurrentlyPanel from './Currently'

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="shell hero-inner">
        <div className="hero-intro">
          <h1 className="hero-name">Brock Huskisson</h1>
          <p className="hero-tagline">
            Sales Engineer at Datadog. The guy who makes sure what&apos;s in the
            contract actually works.
          </p>
        </div>
        <CurrentlyPanel />
      </div>
    </section>
  )
}
