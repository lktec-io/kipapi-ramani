import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Smartphone, ChevronRight, Loader2, CheckCircle2, Lock } from 'lucide-react'
import { useCart } from '../../context/CartContext.jsx'
import { formatTZS } from '../../utils/formatters.js'
import './Checkout.css'

const PAYMENT_METHODS = [
  { id: 'mpesa',  label: 'M-Pesa',       color: '#4caf50', prefix: '06' },
  { id: 'tigo',   label: 'Tigo Pesa',    color: '#1565c0', prefix: '07' },
  { id: 'airtel', label: 'Airtel Money', color: '#e53935', prefix: '068' },
  { id: 'halo',   label: 'Halo Pesa',    color: '#7b1fa2', prefix: '062' },
]

const STEPS = ['Cart', 'Details', 'Payment']

const EMPTY = { name: '', email: '', phone: '', method: '' }
const EMPTY_ERR = { name: '', email: '', phone: '', method: '' }

function validate(fields) {
  const errs = { ...EMPTY_ERR }
  let valid = true

  if (!fields.name.trim() || fields.name.trim().length < 3) {
    errs.name = 'Full name must be at least 3 characters.'; valid = false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errs.email = 'Please enter a valid email address.'; valid = false
  }
  const digits = fields.phone.replace(/\D/g, '')
  if (digits.length < 9 || digits.length > 12) {
    errs.phone = 'Enter a valid Tanzanian phone number (e.g. 0712 345 678).'; valid = false
  }
  if (!fields.method) {
    errs.method = 'Please select a payment network.'; valid = false
  }
  return { errs, valid }
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate  = useNavigate()
  const [fields,  setFields]  = useState(EMPTY)
  const [errors,  setErrors]  = useState(EMPTY_ERR)
  const [status,  setStatus]  = useState('idle') // idle | loading | success

  const update = (key, val) => {
    setFields(prev => ({ ...prev, [key]: val }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  if (items.length === 0 && status !== 'success') {
    return (
      <div className="checkout-empty">
        <h2>No items to checkout</h2>
        <p>Your cart is empty. Add a plan before proceeding.</p>
        <Link to="/plans" className="checkout-empty__btn">Browse Plans</Link>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const { errs, valid } = validate(fields)
    setErrors(errs)
    if (!valid) return

    setStatus('loading')
    // Simulate API call — real implementation posts to POST /api/orders + payment gateway
    setTimeout(() => {
      setStatus('success')
      clearCart()
    }, 2400)
  }

  if (status === 'success') {
    return (
      <div className="checkout-success">
        <div className="checkout-success__icon">
          <CheckCircle2 size={60} strokeWidth={1.5} />
        </div>
        <h2 className="checkout-success__title">Payment Request Sent!</h2>
        <p className="checkout-success__sub">
          A push notification has been sent to <strong>{fields.phone}</strong> via{' '}
          <strong>{PAYMENT_METHODS.find(m => m.id === fields.method)?.label}</strong>.
          Please approve the payment on your phone to complete your order.
        </p>
        <div className="checkout-success__steps">
          <div className="checkout-success__step">1. Check your phone for the payment prompt</div>
          <div className="checkout-success__step">2. Enter your mobile money PIN to confirm</div>
          <div className="checkout-success__step">3. Your download link will be emailed to {fields.email}</div>
        </div>
        <button className="checkout-success__home" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    )
  }

  const method = PAYMENT_METHODS.find(m => m.id === fields.method)

  return (
    <div className="checkout-page">
      <div className="checkout-page__inner">

        {/* ── Progress steps ──────────────────────────────────────────── */}
        <div className="checkout-steps">
          {STEPS.map((step, i) => (
            <div key={step} className={`checkout-step${i === 1 ? ' checkout-step--active' : i < 1 ? ' checkout-step--done' : ''}`}>
              <div className="checkout-step__num">{i < 1 ? '✓' : i + 1}</div>
              <span className="checkout-step__label">{step}</span>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="checkout-step__arrow" />}
            </div>
          ))}
        </div>

        {/* ── Two columns ─────────────────────────────────────────────── */}
        <div className="checkout-grid">

          {/* LEFT — Form */}
          <form className="checkout-form" onSubmit={handleSubmit} noValidate>

            {/* Client details */}
            <section className="form-section">
              <h2 className="form-section__title">Your Details</h2>

              <div className="form-field">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  id="name" type="text" className={`form-input${errors.name ? ' form-input--error' : ''}`}
                  placeholder="e.g. John Mdoe"
                  value={fields.name} onChange={e => update('name', e.target.value)}
                  autoComplete="name"
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email" type="email" className={`form-input${errors.email ? ' form-input--error' : ''}`}
                  placeholder="you@example.co.tz"
                  value={fields.email} onChange={e => update('email', e.target.value)}
                  autoComplete="email"
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
                <span className="form-hint">Your download link will be sent here.</span>
              </div>

              <div className="form-field">
                <label htmlFor="phone" className="form-label">Mobile Money Number</label>
                <div className="form-phone-wrap">
                  <span className="form-phone-prefix">
                    <Smartphone size={14} strokeWidth={1.75} />
                    +255
                  </span>
                  <input
                    id="phone" type="tel"
                    className={`form-input form-input--phone${errors.phone ? ' form-input--error' : ''}`}
                    placeholder="712 345 678"
                    value={fields.phone} onChange={e => update('phone', e.target.value)}
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
            </section>

            {/* Payment method */}
            <section className="form-section">
              <h2 className="form-section__title">Select Payment Network</h2>
              {errors.method && <span className="form-error form-error--standalone">{errors.method}</span>}

              <div className="payment-options">
                {PAYMENT_METHODS.map(m => (
                  <label
                    key={m.id}
                    className={`payment-option${fields.method === m.id ? ' payment-option--selected' : ''}`}
                    style={fields.method === m.id ? { '--pm-color': m.color } : undefined}
                  >
                    <input
                      type="radio" name="method" value={m.id}
                      checked={fields.method === m.id}
                      onChange={() => update('method', m.id)}
                      className="payment-option__radio"
                    />
                    <div className="payment-option__body">
                      <span className="payment-option__badge" style={{ background: m.color }}>
                        {m.label}
                      </span>
                      <div className="payment-option__info">
                        <span className="payment-option__name">{m.label}</span>
                        <span className="payment-option__prefix">Numbers starting with {m.prefix}x</span>
                      </div>
                    </div>
                    <div className={`payment-option__check${fields.method === m.id ? ' payment-option__check--visible' : ''}`}>
                      <CheckCircle2 size={20} strokeWidth={2} />
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Submit */}
            <button
              type="submit"
              className={`checkout-submit-btn${status === 'loading' ? ' checkout-submit-btn--loading' : ''}`}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <><Loader2 size={20} className="checkout-spinner" /> Processing…</>
              ) : (
                <><Smartphone size={20} strokeWidth={1.75} />
                  Initiate Payment via {method?.label || 'Mobile Money'}</>
              )}
            </button>

            <div className="checkout-secure-note">
              <Lock size={13} strokeWidth={1.75} />
              Your payment is processed securely. We do not store payment details.
            </div>
          </form>

          {/* RIGHT — Order summary */}
          <aside className="checkout-summary">
            <div className="checkout-summary__card">
              <h2 className="checkout-summary__title">Order Summary</h2>

              <div className="checkout-summary__items">
                {items.map(plan => (
                  <div key={plan.id} className="checkout-summary__item">
                    <img
                      src={plan.thumbnail_url}
                      alt={plan.title}
                      className="checkout-summary__item-img"
                      loading="lazy"
                    />
                    <div className="checkout-summary__item-info">
                      <span className="checkout-summary__item-name">{plan.title}</span>
                      <span className="checkout-summary__item-meta">
                        {plan.bedrooms} Bed · {plan.style}
                      </span>
                    </div>
                    <span className="checkout-summary__item-price">{formatTZS(plan.price)}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-summary__divider" />

              <div className="checkout-summary__total-row">
                <span className="checkout-summary__total-label">Total to Pay</span>
                <span className="checkout-summary__total-amount">{formatTZS(total)}</span>
              </div>

              {method && (
                <div className="checkout-summary__method-pill" style={{ borderColor: method.color }}>
                  <span className="checkout-summary__method-dot" style={{ background: method.color }} />
                  Paying via {method.label}
                </div>
              )}

              <div className="checkout-summary__guarantee">
                <ShieldCheck size={15} strokeWidth={1.75} />
                <div>
                  <strong>Money-back guarantee</strong>
                  <p>If the plan files cannot be delivered, you receive a full refund.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
