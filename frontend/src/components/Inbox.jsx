import { useState, useEffect, Fragment } from 'react'

const INITIAL = { name: '', message: '' }
const RECENT_LIMIT = 5

// TEMP: local preview data — remove before pushing to prod
const DEMO_MESSAGES = [
  { id: 'demo-1', name: 'Alex Chen', message: 'Saw the Datadog talk — the part about RUM-to-APM trace correlation was the cleanest explanation I\'ve seen. Sharing internally.', created_at: new Date(Date.now() - 12 * 60000).toISOString().slice(0, -1) },
  { id: 'demo-2', name: 'Priya Rao', message: 'Are you still doing the Thursday reading group? Want to join if so.', created_at: new Date(Date.now() - 3 * 3600000).toISOString().slice(0, -1) },
  { id: 'demo-3', name: 'Marcus', message: 'Feature request: dark mode toggle on the hero. The auto-switch caught me off guard last night.', created_at: new Date(Date.now() - 8 * 3600000).toISOString().slice(0, -1) },
  { id: 'demo-4', name: 'Jordan Hale', message: 'This is the cleanest personal site I\'ve seen in a while. What\'s the stack?', created_at: new Date(Date.now() - 26 * 3600000).toISOString().slice(0, -1) },
  { id: 'demo-5', name: 'Sam', message: 'Hey — connected via the SE track. Coffee next time you\'re in NYC?', created_at: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, -1) },
  { id: 'demo-6', name: 'Elena Vasquez', message: 'The inbox pattern is a really nice touch. Stealing the idea for my portfolio.', created_at: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, -1) },
  { id: 'demo-7', name: 'Dev', message: 'First time a personal site made me want to leave an actual message. Nice work.', created_at: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, -1) },
]
const USE_DEMO = false

function getRelativeTime(dateString) {
  const ms = Date.now() - new Date(dateString + 'Z').getTime()
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return `${Math.max(1, minutes)}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default function Inbox() {
  const [form, setForm] = useState(INITIAL)
  const [submitted, setSubmitted] = useState(false)
  const [recentMessages, setRecentMessages] = useState([])
  const [allMessages, setAllMessages] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showingAll, setShowingAll] = useState(false)

  useEffect(() => {
    fetchRecent()
  }, [])

  async function fetchRecent() {
    // TEMP: local preview data — remove this block before pushing to prod
    if (USE_DEMO) {
      setRecentMessages(DEMO_MESSAGES.slice(0, RECENT_LIMIT))
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/inbox/recent')
      const data = await res.json()
      setRecentMessages(data)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadAllMessages() {
    if (allMessages) {
      if (allMessages.length > RECENT_LIMIT) setShowingAll(true)
      return
    }
    // TEMP: local preview data — remove this block before pushing to prod
    if (USE_DEMO) {
      setAllMessages(DEMO_MESSAGES)
      if (DEMO_MESSAGES.length > RECENT_LIMIT) setShowingAll(true)
      return
    }
    try {
      const res = await fetch('/api/inbox/all')
      const data = await res.json()
      setAllMessages(data)
      if (data.length > RECENT_LIMIT) setShowingAll(true)
    } catch (err) {
      console.error('Failed to fetch all messages:', err)
    }
  }

  function collapseMessages() {
    setShowingAll(false)
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
        setAllMessages(null)
        setShowingAll(false)
        fetchRecent()
      }
    } catch (err) {
      console.error('Failed to submit message:', err)
    }
  }

  const displayed = showingAll && allMessages ? allMessages : recentMessages
  const hasMoreToShow =
    recentMessages.length >= RECENT_LIMIT &&
    (!allMessages || allMessages.length > RECENT_LIMIT)

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
            ) : displayed.length === 0 ? (
              <div className="feed-empty-state" role="status">
                <p>No messages yet. Be the first.</p>
              </div>
            ) : (
              <div className="feed-messages">
                {displayed.map((msg, idx) => (
                  <Fragment key={msg.id}>
                    {showingAll && idx === RECENT_LIMIT && (
                      <div className="feed-divider" role="separator">
                        <span>older</span>
                      </div>
                    )}
                    <div
                      className={
                        showingAll && idx >= RECENT_LIMIT
                          ? 'feed-message feed-message--expanded'
                          : 'feed-message'
                      }
                      style={
                        showingAll && idx >= RECENT_LIMIT
                          ? { animationDelay: `${(idx - RECENT_LIMIT) * 0.03}s` }
                          : undefined
                      }
                    >
                      <div className="feed-message-header">
                        <p className="feed-message-name">{msg.name}</p>
                        <time className="feed-message-time" dateTime={msg.created_at}>
                          {getRelativeTime(msg.created_at)}
                        </time>
                      </div>
                      <p className="feed-message-text">{msg.message}</p>
                    </div>
                  </Fragment>
                ))}
                {hasMoreToShow && (
                  <button
                    type="button"
                    className="feed-load-more"
                    onClick={showingAll ? collapseMessages : loadAllMessages}
                  >
                    {showingAll ? 'Show less' : 'Load more'}
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
