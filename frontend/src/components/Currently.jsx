import currentlyRows from '../data/currently.json'

export default function CurrentlyPanel() {
  return (
    <aside className="currently-panel" aria-label="Currently">
      <p className="section-kicker">
        Currently<span className="live-dot" aria-hidden="true" />
      </p>
      <dl className="currently-dl">
        {currentlyRows.map(({ key, value }) => (
          <div key={key} className="currently-row">
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}