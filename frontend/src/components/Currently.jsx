/** Rows shown in the hero “Currently” block (Building, Reading, Watching, Listening). */
export const currentlyRows = [
  { key: 'Building', value: 'brockhusk.com — this site' },
  { key: 'Reading', value: 'The Pragmatic Programmer — Hunt & Thomas' },
  { key: 'Watching', value: 'Severance — Season 2' },
  { key: 'Listening', value: 'Hovvdy — Heavy Lifter' },
]

export default function CurrentlyPanel() {
  return (
    <aside className="currently-panel" aria-label="Currently">
      <p className="label-inbox currently-panel-label">currently</p>
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
