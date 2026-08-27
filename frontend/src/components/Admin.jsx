import { useState, useEffect, useCallback } from 'react'

// The session cookie is httpOnly, so JavaScript cannot read it. Auth state is
// therefore discovered by calling a guarded endpoint and reading the status
// code, never by inspecting document.cookie.
async function api(path, options = {}) {
  return fetch(`/api/admin${path}`, {
    // Explicit for clarity. Same-origin is already the fetch default, and the
    // Vite dev proxy is what makes localhost same-origin in development.
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
}

function formatDate(dateString) {
  // Backend stores naive UTC timestamps, same as the public feed assumes.
  return new Date(dateString + 'Z').toLocaleString()
}

export default function Admin() {
  const [authed, setAuthed] = useState(null) // null = still checking
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [confirmingId, setConfirmingId] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  // useCallback keeps these identities stable across renders so the effect
  // below can declare them as dependencies honestly instead of suppressing the
  // exhaustive-deps lint rule. State setters are guaranteed stable by React, so
  // both dependency arrays are genuinely empty.
  const loadMessages = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api('/messages')
      if (res.status === 401) return setAuthed(false)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setMessages(await res.json())
    } catch (err) {
      setError('Could not load messages.')
      console.error('Failed to load messages:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const res = await api('/me')
      if (res.ok) {
        setAuthed(true)
        loadMessages()
      } else {
        setAuthed(false)
      }
    } catch {
      setAuthed(false)
    }
  }, [loadMessages])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setPassword('')
        setAuthed(true)
        loadMessages()
      } else if (res.status === 401) {
        setLoginError('Incorrect password.')
      } else {
        setLoginError('Login is unavailable right now.')
      }
    } catch (err) {
      setLoginError('Could not reach the server.')
      console.error('Login failed:', err)
    }
  }

  async function handleLogout() {
    await api('/logout', { method: 'POST' })
    setAuthed(false)
    setMessages([])
  }

  async function toggleVisibility(id) {
    setBusyId(id)
    setError('')
    try {
      const res = await api(`/messages/${id}`, { method: 'PATCH', body: '{}' })
      if (res.status === 401) return setAuthed(false)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const updated = await res.json()
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, visible: updated.visible } : m))
      )
    } catch (err) {
      setError('Could not update that message.')
      console.error('Failed to toggle visibility:', err)
    } finally {
      setBusyId(null)
    }
  }

  async function deleteMessage(id) {
    setBusyId(id)
    setError('')
    try {
      const res = await api(`/messages/${id}`, { method: 'DELETE' })
      if (res.status === 401) return setAuthed(false)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setMessages((prev) => prev.filter((m) => m.id !== id))
      setConfirmingId(null)
    } catch (err) {
      setError('Could not delete that message.')
      console.error('Failed to delete message:', err)
    } finally {
      setBusyId(null)
    }
  }

  if (authed === null) {
    return (
      <main className="main">
        <div className="shell admin-shell">
          <p className="admin-status">Checking session...</p>
        </div>
      </main>
    )
  }

  if (!authed) {
    return (
      <main className="main">
        <div className="shell admin-shell">
          <h1 className="section-kicker">Admin</h1>
          <form className="admin-login" onSubmit={handleLogin}>
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              aria-label="Admin password"
            />
            <button type="submit" className="admin-btn admin-btn--primary">
              Sign in
            </button>
          </form>
          {loginError && (
            <p className="admin-error" role="alert">
              {loginError}
            </p>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      <div className="shell admin-shell">
        <div className="admin-header">
          <h1 className="section-kicker">Messages</h1>
          <button type="button" className="admin-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="admin-status">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="admin-status">No messages yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Message</th>
                <th>Received</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} className={msg.visible ? undefined : 'admin-row--hidden'}>
                  <td>{msg.name}</td>
                  <td className="admin-cell-message">{msg.message}</td>
                  <td className="admin-cell-date">{formatDate(msg.created_at)}</td>
                  <td>
                    <span
                      className={
                        msg.visible
                          ? 'admin-badge admin-badge--visible'
                          : 'admin-badge admin-badge--hidden'
                      }
                    >
                      {msg.visible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="admin-actions">
                    {confirmingId === msg.id ? (
                      <>
                        {/* Two step confirmation. The request only fires on the
                            second, explicitly labelled click. */}
                        <span className="admin-confirm-prompt">Delete permanently?</span>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          disabled={busyId === msg.id}
                          onClick={() => deleteMessage(msg.id)}
                        >
                          {busyId === msg.id ? 'Deleting...' : 'Yes, delete'}
                        </button>
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => setConfirmingId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="admin-btn"
                          disabled={busyId === msg.id}
                          onClick={() => toggleVisibility(msg.id)}
                        >
                          {msg.visible ? 'Hide' : 'Show'}
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger-text"
                          onClick={() => setConfirmingId(msg.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
