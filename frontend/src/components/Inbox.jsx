import { useState, useEffect } from 'react'

const INITIAL = { name: '', message: '' }

function formatTimestamp(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function Inbox() {
  const [form, setForm] = useState(INITIAL)
  const [submitted, setSubmitted] = useState(false)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  async function fetchMessages() {
    try {
      const res = await fetch('/api/inbox/recent')
      const data = await res.json()
      setMessages(data)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) return

    try {
      const res = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, message: form.message }),
      })
      if (res.ok) {
        setSubmitted(true)
        setForm(INITIAL)
        fetchMessages()
      }
    } catch (err) {
      console.error('Failed to submit message:', err)
    }
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
            {loading ? (
              <p>Loading...</p>
            ) : messages.length === 0 ? (
              <div className="feed-empty-state" role="status">
                <p>No messages yet. Be the first.</p>
              </div>
            ) : (
              <div className="feed-messages">
                {messages.map((msg) => (
                  <div key={msg.id} className="feed-message">
                    <p className="feed-message-name">{msg.name}</p>
                    <p className="feed-message-text">{msg.message}</p>
                    <time className="feed-message-time" dateTime={msg.created_at}>
                      {formatTimestamp(msg.created_at)}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}