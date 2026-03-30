/** Rows shown in the hero “Currently” block. */
export const currentlyRows = [
  { key: 'Building', value: 'Personal site on a home server' },
  { key: 'Reading', value: 'Project Hail Mary' },
  { key: 'Watching', value: 'Breaking Bad' },
  { key: 'Listening', value: 'Sam Barber - Restless Mind' },
  { key: 'Suffering', value: 'New York Jets fan' },
]

export default function CurrentlyPanel() {
  return (
    <aside className="currently-panel" aria-label="Currently">
      <p className="section-kicker">Currently</p>
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
