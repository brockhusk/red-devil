import { useState } from 'react'

const INITIAL = { name: '', message: '' }

const MOCK_FEED = [
  {
    id: '1',
    name: 'Jordan',
    message:
      'Finally cracked open Designing Data-Intensive Applications — thanks for the nudge.',
    time: '2 days ago',
  },
  {
    id: '2',
    name: 'Sam',
    message: 'If you liked Severance, you owe yourself Slow Horses. Trust me.',
    time: '5 days ago',
  },
  {
    id: '3',
    name: 'Riley',
    message:
      'Say hi back! Your bit on local-first sync made me rethink my side project.',
    time: '1 week ago',
  },
  {
    id: '4',
    name: 'Morgan',
    message:
      'Friendly argument: tabs over spaces. I will not be taking questions.',
    time: 'just now',
  },
]

export default function Inbox() {
  const [form, setForm] = useState(INITIAL)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) return
    setSubmitted(true)
    setForm(INITIAL)
  }

  return (
    <section id="inbox" className="section-inbox">
      <div className="shell section-inbox-inner">
        <div className="inbox-wrap">
          <h2 className="label-inbox inbox-title">inbox</h2>
          <p className="inbox-intro">
            This is my inbox. Real people, real messages. Leave something and
            I&apos;ll read it.
          </p>

          {submitted ? (
            <div className="composer-card composer-success">
              <p className="composer-success-text">
                Got it. You&apos;re now in my inbox.
              </p>
              <button
                type="button"
                className="composer-send-another"
                onClick={() => setSubmitted(false)}
              >
                send another
              </button>
            </div>
          ) : (
            <form className="composer-card" onSubmit={handleSubmit}>
              <textarea
                id="inbox-message"
                name="message"
                className="composer-textarea"
                placeholder={"What's on your mind?"}
                value={form.message}
                onChange={handleChange}
                autoComplete="off"
                aria-label="Message"
              />
              <div className="composer-footer">
                <input
                  id="inbox-name"
                  name="name"
                  type="text"
                  className="composer-name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  aria-label="Your name"
                />
                <button type="submit" className="composer-send">
                  Send
                </button>
              </div>
            </form>
          )}

          <h3 className="label-inbox feed-title">recent messages</h3>
          <ul className="feed-stack">
            {MOCK_FEED.map((entry) => (
              <li key={entry.id} className="feed-item">
                <div className="feed-item-meta">
                  <span className="feed-item-name">{entry.name}</span>
                  <span className="feed-item-time">{entry.time}</span>
                </div>
                <p className="feed-item-message">{entry.message}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
