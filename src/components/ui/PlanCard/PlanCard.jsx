import { Link } from 'react-router-dom'
import { Bed, Bath, Layers, Maximize2, ShoppingCart } from 'lucide-react'
import { useCart } from '../../../context/CartContext.jsx'
import { formatTZS } from '../../../utils/formatters.js'
import './PlanCard.css'

// Repeated enough times to tile the entire image diagonally
const WATERMARK_TILES = Array.from({ length: 24 })

export default function PlanCard({ plan }) {
  const { addToCart, items } = useCart()
  const inCart = items.some(i => i.id === plan.id)

  return (
    <article className="plan-card">

      {/* ── Thumbnail + watermark overlay ─────────────────────── */}
      <div className="plan-card__img-wrap">
        <img
          src={plan.thumbnail_url}
          alt={plan.title}
          className="plan-card__img"
          loading="lazy"
        />

        {/* CSS watermark — simulates protection on preview images */}
        <div className="plan-card__watermark" aria-hidden="true">
          {WATERMARK_TILES.map((_, i) => (
            <span key={i} className="plan-card__wm-text">KIPAPI RAMANI PRO</span>
          ))}
        </div>

        {/* Style badge */}
        <span className={`plan-card__style-badge plan-card__style-badge--${plan.style.toLowerCase()}`}>
          {plan.style}
        </span>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="plan-card__body">
        <h3 className="plan-card__title">{plan.title}</h3>

        {/* Specs row */}
        <ul className="plan-card__specs">
          <li className="plan-card__spec" title="Bedrooms">
            <Bed size={14} strokeWidth={1.75} />
            <span>{plan.bedrooms} Bed</span>
          </li>
          <li className="plan-card__spec" title="Bathrooms">
            <Bath size={14} strokeWidth={1.75} />
            <span>{plan.bathrooms} Bath</span>
          </li>
          <li className="plan-card__spec" title="Stories">
            <Layers size={14} strokeWidth={1.75} />
            <span>{plan.stories === 1 ? 'Bungalow' : `${plan.stories} Floors`}</span>
          </li>
          {plan.plot_size && (
            <li className="plan-card__spec" title="Plot size">
              <Maximize2 size={13} strokeWidth={1.75} />
              <span>{plan.plot_size}</span>
            </li>
          )}
        </ul>

        {/* Price + actions */}
        <div className="plan-card__footer">
          <p className="plan-card__price">{formatTZS(plan.price)}</p>
          <div className="plan-card__actions">
            <button
              className={`plan-card__cart-btn${inCart ? ' plan-card__cart-btn--added' : ''}`}
              onClick={() => addToCart(plan)}
              disabled={inCart}
              aria-label={inCart ? 'Already in cart' : 'Add to cart'}
            >
              <ShoppingCart size={14} strokeWidth={1.75} />
            </button>
            <Link to={`/plans/${plan.id}`} className="plan-card__detail-btn">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
