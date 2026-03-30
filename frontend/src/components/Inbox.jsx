import { useState } from 'react'

const INITIAL = { name: '', message: '' }

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
      <div className="shell">
        <div className="inbox-grid">

          <div className="inbox-left">
            <h2 className="section-kicker">Personal Inbox</h2>
            <p className="inbox-intro">
              Leave a real message for Brock.
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
                  placeholder="What are you building? Reading? Grinding through? Say hi or leave a feature request here."
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
          </div>

          <div className="inbox-right">
            <p className="feed-subtitle">recent messages</p>
            <div className="feed-empty-state" role="status">
              <p>No messages yet. Be the first.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
