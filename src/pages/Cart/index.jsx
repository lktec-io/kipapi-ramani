import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingCart, ArrowRight, ShieldCheck } from 'lucide-react'
import { useCart } from '../../context/CartContext.jsx'
import { formatTZS } from '../../utils/formatters.js'
import './Cart.css'

export default function CartPage() {
  const { items, removeFromCart, clearCart, total } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__icon">
          <ShoppingCart size={52} strokeWidth={1.25} />
        </div>
        <h2 className="cart-empty__title">Your cart is empty</h2>
        <p className="cart-empty__sub">Browse our catalogue and add a house plan to get started.</p>
        <Link to="/plans" className="cart-empty__btn">
          Browse Plans <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-page__inner">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="cart-header">
          <div>
            <p className="cart-header__eyebrow">Review your selection</p>
            <h1 className="cart-header__title">Shopping Cart</h1>
          </div>
          <span className="cart-header__count">
            {items.length} plan{items.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Body: items + summary ──────────────────────────────────── */}
        <div className="cart-body">

          {/* Items list */}
          <div className="cart-items">
            {items.map((plan, idx) => (
              <div
                key={plan.id}
                className="cart-item"
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                <Link to={`/plans/${plan.id}`} className="cart-item__img-wrap">
                  <img
                    src={plan.thumbnail_url}
                    alt={plan.title}
                    className="cart-item__img"
                    loading="lazy"
                  />
                </Link>

                <div className="cart-item__details">
                  <Link to={`/plans/${plan.id}`} className="cart-item__title">
                    {plan.title}
                  </Link>
                  <div className="cart-item__meta">
                    <span className={`cart-item__style cart-item__style--${plan.style.toLowerCase()}`}>
                      {plan.style}
                    </span>
                    <span className="cart-item__spec">{plan.bedrooms} Bed</span>
                    <span className="cart-item__spec">{plan.bathrooms} Bath</span>
                    <span className="cart-item__spec">
                      {plan.stories === 1 ? 'Bungalow' : `${plan.stories} Floors`}
                    </span>
                  </div>
                  <p className="cart-item__format">
                    Includes: PDF + AutoCAD DWG + Floor plan sheets
                  </p>
                </div>

                <div className="cart-item__right">
                  <span className="cart-item__price">{formatTZS(plan.price)}</span>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeFromCart(plan.id)}
                    aria-label={`Remove ${plan.title} from cart`}
                  >
                    <Trash2 size={16} strokeWidth={1.75} />
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Clear all */}
            <button className="cart-clear-btn" onClick={clearCart}>
              Clear entire cart
            </button>
          </div>

          {/* ── Order Summary sidebar ──────────────────────────────────── */}
          <aside className="cart-summary">
            <div className="cart-summary__card">
              <h2 className="cart-summary__title">Order Summary</h2>

              <div className="cart-summary__lines">
                {items.map(plan => (
                  <div key={plan.id} className="cart-summary__line">
                    <span className="cart-summary__line-name">{plan.title}</span>
                    <span className="cart-summary__line-price">{formatTZS(plan.price)}</span>
                  </div>
                ))}
              </div>

              <div className="cart-summary__divider" />

              <div className="cart-summary__total-row">
                <span className="cart-summary__total-label">Total</span>
                <span className="cart-summary__total-price">{formatTZS(total)}</span>
              </div>

              <button
                className="cart-summary__checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight size={18} strokeWidth={2} />
              </button>

              <Link to="/plans" className="cart-summary__continue">
                ← Continue Shopping
              </Link>

              {/* Trust row */}
              <div className="cart-summary__trust">
                <ShieldCheck size={14} strokeWidth={1.75} className="cart-summary__trust-icon" />
                <span>Secure checkout · Payments via Mobile Money</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
