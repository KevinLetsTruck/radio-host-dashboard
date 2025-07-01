import { useState, useEffect } from 'react'

const API_BASE = 'https://audioroad-webrtc-system.onrender.com'

function App() {
  const [callers, setCallers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const fetchCallers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/callers`)
      if (!response.ok) {
        throw new Error('Failed to fetch callers')
      }
      const data = await response.json()
      setCallers(data)
      setError(null)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCallers()
    const interval = setInterval(fetchCallers, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const formatWaitTime = (timestamp) => {
    const now = new Date()
    const callTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - callTime) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just called'
    if (diffInMinutes === 1) return '1 minute'
    return `${diffInMinutes} minutes`
  }

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      default: return 'priority-normal'
    }
  }

  const getCallerType = (phone) => {
    // Mock caller history logic - replace with real data
    const returningCallers = ['555-0123', '555-0456']
    return returningCallers.includes(phone) ? 'returning' : 'new'
  }

  const getCallerHistory = (phone) => {
    // Mock history data - replace with real API call
    const historyData = {
      '555-0123': [
        { date: '2024-12-15', topic: 'DEF fluid questions' },
        { date: '2024-11-20', topic: 'Transmission issues' }
      ],
      '555-0456': [
        { date: '2024-12-10', topic: 'Fuel efficiency tips' }
      ]
    }
    return historyData[phone] || []
  }

  const activeCallers = callers.filter(caller => caller.status !== 'completed')
  const waitingCallers = activeCallers.filter(caller => caller.status === 'waiting')
  const priorityCallers = activeCallers.filter(caller => caller.priority === 'high')

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <h2>Loading Host Dashboard...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button className="refresh-button" onClick={fetchCallers}>
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>🎙️ Host Dashboard</h1>
          <div className="live-indicator">
            <div className="live-dot"></div>
            LIVE
          </div>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      <div className="status-bar">
        <div className="status-item">
          <span>📞 Waiting:</span>
          <span className="status-count">{waitingCallers.length}</span>
        </div>
        <div className="status-item">
          <span>🔥 Priority:</span>
          <span className="status-count">{priorityCallers.length}</span>
        </div>
        <div className="status-item">
          <span>📋 Total Active:</span>
          <span className="status-count">{activeCallers.length}</span>
        </div>
      </div>

      {activeCallers.length === 0 ? (
        <div className="empty-state">
          <h3>No Active Callers</h3>
          <p>Waiting for Angie to screen incoming calls...</p>
          <button className="refresh-button" onClick={fetchCallers}>
            Refresh
          </button>
        </div>
      ) : (
        <div className="callers-grid">
          {activeCallers.map((caller) => {
            const callerType = getCallerType(caller.phone)
            const history = getCallerHistory(caller.phone)
            
            return (
              <div key={caller.id} className="caller-card">
                <div className="caller-header">
                  <div>
                    <div className="caller-name">{caller.name}</div>
                    <div className="caller-phone">{caller.phone}</div>
                  </div>
                  <div className={`priority-badge ${getPriorityClass(caller.priority)}`}>
                    {caller.priority || 'Normal'}
                  </div>
                </div>

                <div className="caller-topic">
                  <strong>Topic:</strong> {caller.topic}
                </div>

                {caller.notes && (
                  <div className="caller-notes">
