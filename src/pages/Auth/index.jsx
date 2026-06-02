import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Building2, Loader2, AlertCircle, Check, ShieldCheck, Zap, Download } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { loginUser, registerUser } from '../../services/authService.js'
import './Auth.css'

const BRAND_FEATURES = [
  { icon: <Download size={16} />,    text: 'Instant plan downloads after payment' },
  { icon: <ShieldCheck size={16} />, text: 'Secure mobile money checkout'          },
  { icon: <Zap size={16} />,         text: 'Engineer-verified, council-accepted'   },
]

// Derive initials for a future avatar once logged in
const initials = (name = '') => name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

export default function AuthPage({ defaultMode = 'login' }) {
  const location = useLocation()
  const navigate  = useNavigate()
  const { login, isAuthenticated } = useAuth()

  // Derive initial mode from route: /auth → login, /auth/register → register
  const routeMode = location.pathname.includes('register') ? 'register' : defaultMode
  const [mode,    setMode]    = useState(routeMode)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  // Form fields
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [showCf, setShowCf] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  // Clear errors and reset fields on mode switch
  const switchMode = (next) => {
    setMode(next)
    setError('')
    setSuccess('')
    setFields({ name: '', email: '', password: '', confirm: '' })
    setShowPw(false)
    setShowCf(false)
    navigate(next === 'register' ? '/auth/register' : '/auth', { replace: true })
  }

  const set = (key, val) => {
    setFields(prev => ({ ...prev, [key]: val }))
    if (error) setError('')
  }

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    if (mode === 'register' && fields.name.trim().length < 3)
      return 'Full name must be at least 3 characters.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      return 'Please enter a valid email address.'
    if (fields.password.length < 8)
      return 'Password must be at least 8 characters.'
    if (mode === 'register' && fields.password !== fields.confirm)
      return 'Passwords do not match.'
    return null
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')

    try {
      let data
      if (mode === 'login') {
        data = await loginUser(fields.email, fields.password)
      } else {
        data = await registerUser(fields.name, fields.email, fields.password)
        setSuccess(`Account created! Welcome, ${data.user?.name?.split(' ')[0]}.`)
      }
      login(data.user, data.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      {/* ── Left brand panel (desktop only) ──────────────────────────────── */}
      <div className="auth-brand" aria-hidden="true">
        <div className="auth-brand__circles">
          <div className="auth-brand__circle auth-brand__circle--1" />
          <div className="auth-brand__circle auth-brand__circle--2" />
          <div className="auth-brand__circle auth-brand__circle--3" />
        </div>

        <div className="auth-brand__content">
          <Link to="/" className="auth-brand__logo">
            <div className="auth-brand__logo-icon"><Building2 size={20} color="#fff" strokeWidth={1.75} /></div>
            <div className="auth-brand__logo-text">
              <span className="auth-brand__logo-title">Kipapi Ramani</span>
              <span className="auth-brand__logo-tagline">House Plans</span>
            </div>
          </Link>

          <div className="auth-brand__headline">
            <p className="auth-brand__eyebrow">Tanzania's #1 Marketplace</p>
            <h2 className="auth-brand__title">
              Borrow the vision.<br />
              <span className="auth-brand__title-accent">Own the plan.</span>
            </h2>
            <p className="auth-brand__sub">
              Join thousands of Tanzanians who found, bought, and built their dream homes using our certified architectural plans.
            </p>
          </div>

          <ul className="auth-brand__features">
            {BRAND_FEATURES.map((f, i) => (
              <li key={i} className="auth-brand__feature">
                <span className="auth-brand__feature-icon">{f.icon}</span>
                {f.text}
              </li>
            ))}
          </ul>

          <div className="auth-brand__quote">
            <p>"The plan was exactly what I needed — stamped and ready for council submission."</p>
            <span>— Amina J., Dar es Salaam</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-card">

          {/* Mobile logo (hidden on desktop) */}
          <Link to="/" className="auth-card__mobile-logo">
            <div className="auth-card__mobile-logo-icon"><Building2 size={16} color="#fff" strokeWidth={1.75} /></div>
            <span>Kipapi Ramani</span>
          </Link>

          {/* Mode toggle pill */}
          <div className="auth-toggle" role="tablist">
            <button
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-toggle__btn${mode === 'login' ? ' auth-toggle__btn--active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Log In
            </button>
            <button
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-toggle__btn${mode === 'register' ? ' auth-toggle__btn--active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Create Account
            </button>
          </div>

          {/* Error / success banners */}
          {error && (
            <div className="auth-alert auth-alert--error" role="alert">
              <AlertCircle size={15} strokeWidth={2} />
              {error}
            </div>
          )}
          {success && (
            <div className="auth-alert auth-alert--success" role="status">
              <Check size={15} strokeWidth={2.5} />
              {success}
            </div>
          )}

          {/* ── Form ───────────────────────────────────────────────── */}
          <form
            key={mode}                 /* key forces re-mount → re-triggers entry animation */
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label={mode === 'login' ? 'Login form' : 'Registration form'}
          >
            <h1 className="auth-form__title">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="auth-form__sub">
              {mode === 'login'
                ? 'Sign in to access your purchased plans and downloads.'
                : 'Join Kipapi Ramani to buy and download house plans instantly.'}
            </p>

            {mode === 'register' && (
              <div className="auth-field">
                <label htmlFor="auth-name" className="auth-label">Full Name</label>
                <input
                  id="auth-name" type="text"
                  className="auth-input"
                  placeholder="e.g. John Mdoe"
                  value={fields.name}
                  onChange={e => set('name', e.target.value)}
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email" className="auth-label">Email Address</label>
              <input
                id="auth-email" type="email"
                className="auth-input"
                placeholder="you@example.co.tz"
                value={fields.email}
                onChange={e => set('email', e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="auth-password" className="auth-label">Password</label>
                {mode === 'login' && (
                  <a href="#" className="auth-forgot" tabIndex={-1}>Forgot password?</a>
                )}
              </div>
              <div className="auth-input-wrap">
                <input
                  id="auth-password"
                  type={showPw ? 'text' : 'password'}
                  className="auth-input auth-input--pw"
                  placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
                  value={fields.password}
                  onChange={e => set('password', e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="auth-field">
                <label htmlFor="auth-confirm" className="auth-label">Confirm Password</label>
                <div className="auth-input-wrap">
                  <input
                    id="auth-confirm"
                    type={showCf ? 'text' : 'password'}
                    className="auth-input auth-input--pw"
                    placeholder="Repeat your password"
                    value={fields.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowCf(v => !v)}
                    aria-label={showCf ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showCf ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <p className="auth-terms">
                By registering you agree to our{' '}
                <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </p>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading
                ? <><Loader2 size={18} className="auth-spinner" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
                : mode === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button className="auth-switch__btn" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
