import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Download, Clock, CheckCircle2, AlertCircle,
  LayoutDashboard, Settings, ShoppingBag,
  Eye, EyeOff, Loader2, Save,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { mockPlans } from '../../services/mockPlans.js'
import { formatTZS, formatDate } from '../../utils/formatters.js'
import './Dashboard.css'

// ── Mock order history (joined with mockPlans for plan details) ─────────────
const RAW_ORDERS = [
  { id: 'ORD-2024-001', plan_id: 1, payment_status: 'paid',    payment_method: 'M-Pesa',       created_at: '2024-01-15T10:30:00Z', total_amount: 1_400_000 },
  { id: 'ORD-2024-002', plan_id: 2, payment_status: 'paid',    payment_method: 'Tigo Pesa',    created_at: '2024-03-22T14:22:00Z', total_amount:   680_000 },
  { id: 'ORD-2024-003', plan_id: 5, payment_status: 'pending', payment_method: 'Airtel Money', created_at: '2024-06-01T09:15:00Z', total_amount:   350_000 },
]

const ORDERS = RAW_ORDERS.map(o => ({
  ...o,
  plan: mockPlans.find(p => p.id === o.plan_id),
}))

// Generate avatar initials from full name
const initials = (name = '') =>
  name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

const STATUS_CONFIG = {
  paid:    { icon: <CheckCircle2 size={14} strokeWidth={2} />, label: 'Paid',       cls: 'status--paid'    },
  pending: { icon: <Clock size={14} strokeWidth={2} />,        label: 'Processing', cls: 'status--pending' },
  failed:  { icon: <AlertCircle size={14} strokeWidth={2} />,  label: 'Failed',     cls: 'status--failed'  },
}

// Summary stats
const totalSpent    = ORDERS.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total_amount, 0)
const paidCount     = ORDERS.filter(o => o.payment_status === 'paid').length
const latestOrder   = [...ORDERS].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

export default function DashboardPage() {
  const { user } = useAuth()
  const [tab,        setTab]        = useState('plans')   // 'plans' | 'settings'
  const [downloading, setDownloading] = useState(null)    // order ID being "downloaded"

  // Settings form state
  const [settingsName, setSettingsName] = useState(user?.name   || '')
  const [settingsEmail]                 = useState(user?.email  || '')  // read-only
  const [currentPw,    setCurrentPw]    = useState('')
  const [newPw,        setNewPw]        = useState('')
  const [confirmPw,    setConfirmPw]    = useState('')
  const [showPw,       setShowPw]       = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [saveMsg,      setSaveMsg]      = useState('')

  const firstName = user?.name?.split(' ')[0] || 'there'
  const avatar    = initials(user?.name)

  // Simulate file download (real version calls GET /api/downloads/:token)
  const handleDownload = (orderId) => {
    setDownloading(orderId)
    setTimeout(() => {
      setDownloading(null)
      alert('Your download link has been sent to your registered email address.\n\n(In production this would trigger an instant file download.)')
    }, 1800)
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    if (newPw && newPw !== confirmPw) { setSaveMsg('New passwords do not match.'); return }
    if (newPw && newPw.length < 8)    { setSaveMsg('New password must be at least 8 characters.'); return }
    setSaving(true); setSaveMsg('')
    await new Promise(r => setTimeout(r, 1400)) // simulate API call
    setSaving(false)
    setSaveMsg('Settings saved successfully.')
    setTimeout(() => setSaveMsg(''), 3500)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
  }

  return (
    <div className="dashboard">

      {/* ── Welcome / Stats banner ─────────────────────────────────────── */}
      <header className="dash-hero">
        <div className="dash-hero__inner">
          <div className="dash-hero__left">
            <div className="dash-hero__avatar" aria-hidden="true">{avatar}</div>
            <div className="dash-hero__greeting">
              <p className="dash-hero__eyebrow">Client Portal</p>
              <h1 className="dash-hero__title">Karibu tena, {firstName}!</h1>
              <p className="dash-hero__sub">{user?.email}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="dash-hero__stats">
            <div className="dash-stat">
              <span className="dash-stat__value">{paidCount}</span>
              <span className="dash-stat__label">Plans Purchased</span>
            </div>
            <div className="dash-stat">
              <span className="dash-stat__value">{formatTZS(totalSpent)}</span>
              <span className="dash-stat__label">Total Spent</span>
            </div>
            <div className="dash-stat">
              <span className="dash-stat__value">
                {latestOrder ? formatDate(latestOrder.created_at) : '—'}
              </span>
              <span className="dash-stat__label">Last Order</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tab nav ───────────────────────────────────────────────────────── */}
      <div className="dash-tabs">
        <div className="dash-tabs__inner">
          <button
            className={`dash-tab${tab === 'plans' ? ' dash-tab--active' : ''}`}
            onClick={() => setTab('plans')}
          >
            <ShoppingBag size={16} strokeWidth={1.75} />
            My Purchased Plans
          </button>
          <button
            className={`dash-tab${tab === 'settings' ? ' dash-tab--active' : ''}`}
            onClick={() => setTab('settings')}
          >
            <Settings size={16} strokeWidth={1.75} />
            Account Settings
          </button>
        </div>
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <div className="dash-body">
        <div className="dash-body__inner">

          {/* ── TAB 1: My Plans ──────────────────────────────────────────── */}
          {tab === 'plans' && (
            <div className="dash-panel" key="plans">
              <div className="dash-panel__head">
                <h2 className="dash-panel__title">My Purchased Plans</h2>
                <Link to="/plans" className="dash-panel__browse">Browse more plans →</Link>
              </div>

              {ORDERS.length === 0 ? (
                <div className="dash-empty">
                  <LayoutDashboard size={44} strokeWidth={1.25} className="dash-empty__icon" />
                  <p className="dash-empty__title">No purchases yet</p>
                  <p className="dash-empty__sub">Find a plan you love and it will appear here after checkout.</p>
                  <Link to="/plans" className="dash-empty__btn">Browse Plans</Link>
                </div>
              ) : (
                <div className="orders-list">
                  {ORDERS.map((order, idx) => {
                    const st = STATUS_CONFIG[order.payment_status] || STATUS_CONFIG.pending
                    return (
                      <div
                        key={order.id}
                        className="order-card"
                        style={{ animationDelay: `${idx * 0.08}s` }}
                      >
                        {/* Thumbnail */}
                        <Link to={`/plans/${order.plan_id}`} className="order-card__img-wrap">
                          <img
                            src={order.plan?.thumbnail_url}
                            alt={order.plan?.title}
                            className="order-card__img"
                            loading="lazy"
                          />
                        </Link>

                        {/* Details */}
                        <div className="order-card__details">
                          <Link to={`/plans/${order.plan_id}`} className="order-card__title">
                            {order.plan?.title ?? 'Unknown Plan'}
                          </Link>
                          <div className="order-card__meta">
                            <span className="order-card__meta-item">
                              {order.plan?.bedrooms} Bed · {order.plan?.style}
                            </span>
                            <span className="order-card__meta-sep">·</span>
                            <span className="order-card__meta-item">Via {order.payment_method}</span>
                          </div>
                          <div className="order-card__bottom">
                            <span className="order-card__date">
                              {formatDate(order.created_at)}
                            </span>
                            <span className={`order-status ${st.cls}`}>
                              {st.icon}
                              {st.label}
                            </span>
                          </div>
                        </div>

                        {/* Price + download */}
                        <div className="order-card__right">
                          <span className="order-card__price">{formatTZS(order.total_amount)}</span>
                          <button
                            className={`order-download-btn${order.payment_status !== 'paid' ? ' order-download-btn--disabled' : ''}`}
                            disabled={order.payment_status !== 'paid' || downloading === order.id}
                            onClick={() => handleDownload(order.id)}
                            title={order.payment_status !== 'paid' ? 'Payment is still processing' : 'Download your plan files'}
                          >
                            {downloading === order.id
                              ? <Loader2 size={15} className="auth-spinner" />
                              : <Download size={15} strokeWidth={1.75} />
                            }
                            {downloading === order.id ? 'Preparing…' : 'Download'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: Account Settings ───────────────────────────────────── */}
          {tab === 'settings' && (
            <div className="dash-panel" key="settings">
              <div className="dash-panel__head">
                <h2 className="dash-panel__title">Account Settings</h2>
              </div>

              <form className="settings-form" onSubmit={handleSaveSettings} noValidate>

                {/* Profile section */}
                <div className="settings-section">
                  <h3 className="settings-section__title">Profile Information</h3>

                  {/* Avatar preview */}
                  <div className="settings-avatar-row">
                    <div className="settings-avatar">{avatar}</div>
                    <div className="settings-avatar-info">
                      <p className="settings-avatar-name">{user?.name}</p>
                      <p className="settings-avatar-role">Client Account</p>
                    </div>
                  </div>

                  <div className="settings-grid">
                    <div className="form-field">
                      <label htmlFor="s-name" className="auth-label">Display Name</label>
                      <input
                        id="s-name" type="text" className="auth-input"
                        value={settingsName}
                        onChange={e => setSettingsName(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="s-email" className="auth-label">Email Address</label>
                      <input
                        id="s-email" type="email" className="auth-input auth-input--readonly"
                        value={settingsEmail} readOnly
                        title="Email cannot be changed"
                      />
                    </div>
                  </div>
                </div>

                {/* Password section */}
                <div className="settings-section">
                  <h3 className="settings-section__title">Change Password</h3>
                  <p className="settings-section__sub">Leave blank if you don't want to change your password.</p>

                  <div className="settings-grid">
                    <div className="form-field">
                      <label htmlFor="s-curr-pw" className="auth-label">Current Password</label>
                      <div className="auth-input-wrap">
                        <input
                          id="s-curr-pw"
                          type={showPw ? 'text' : 'password'}
                          className="auth-input auth-input--pw"
                          placeholder="Enter current password"
                          value={currentPw}
                          onChange={e => setCurrentPw(e.target.value)}
                          disabled={saving}
                          autoComplete="current-password"
                        />
                        <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                          {showPw ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                        </button>
                      </div>
                    </div>
                    <div className="form-field" /> {/* empty cell for grid alignment */}
                    <div className="form-field">
                      <label htmlFor="s-new-pw" className="auth-label">New Password</label>
                      <input
                        id="s-new-pw" type="password" className="auth-input"
                        placeholder="At least 8 characters"
                        value={newPw} onChange={e => setNewPw(e.target.value)}
                        disabled={saving} autoComplete="new-password"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="s-conf-pw" className="auth-label">Confirm New Password</label>
                      <input
                        id="s-conf-pw" type="password" className="auth-input"
                        placeholder="Repeat new password"
                        value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                        disabled={saving} autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                {/* Save feedback */}
                {saveMsg && (
                  <div className={`auth-alert ${saveMsg.includes('success') ? 'auth-alert--success' : 'auth-alert--error'}`}>
                    {saveMsg.includes('success')
                      ? <CheckCircle2 size={15} strokeWidth={2} />
                      : <AlertCircle  size={15} strokeWidth={2} />}
                    {saveMsg}
                  </div>
                )}

                <div className="settings-actions">
                  <button type="submit" className="settings-save-btn" disabled={saving}>
                    {saving
                      ? <><Loader2 size={16} className="auth-spinner" /> Saving…</>
                      : <><Save size={16} strokeWidth={1.75} /> Save Changes</>
                    }
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
