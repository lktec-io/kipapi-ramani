import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bed, Bath, Layers, Maximize2, ShoppingCart,
  ArrowLeftRight, ArrowUpDown, Check,
} from 'lucide-react'
import { useCart } from '../../../context/CartContext.jsx'
import { formatTZS } from '../../../utils/formatters.js'
import './PlanCard.css'

const WATERMARK_TILES = Array.from({ length: 24 })

// Parse "20m × 25m" → { width: 20, length: 25, area: 500 }
const parsePlotSize = (plotSize) => {
  if (!plotSize) return {}
  const m = plotSize.match(/(\d+(?:\.\d+)?)\s*m?\s*[×xX]\s*(\d+(?:\.\d+)?)\s*m?/)
  if (!m) return {}
  const w = parseFloat(m[1])
  const l = parseFloat(m[2])
  return { width: w, length: l, area: Math.round(w * l) }
}

export default function PlanCard({ plan }) {
  const { addToCart, items } = useCart()
  const navigate = useNavigate()
  const [quickBought, setQuickBought] = useState(false)

  const inCart = items.some(i => i.id === plan.id)
  const dims   = parsePlotSize(plan.plot_size)

  const handleQuickBuy = (e) => {
    e.preventDefault()
    if (inCart) { navigate('/cart'); return }
    addToCart(plan)
    setQuickBought(true)
    setTimeout(() => setQuickBought(false), 1800)
  }

  const handleCart = () => inCart ? navigate('/cart') : addToCart(plan)

  return (
    <article className="plan-card">

      {/* ── Thumbnail ────────────────────────────────────────────── */}
      <div className="plan-card__img-wrap">
        <img
          src={plan.thumbnail_url}
          alt={plan.title}
          className="plan-card__img"
          loading="lazy"
        />

        {/* 45° tiled watermark */}
        <div className="plan-card__watermark" aria-hidden="true">
          {WATERMARK_TILES.map((_, i) => (
            <span key={i} className="plan-card__wm-text">KIPAPI RAMANI PRO</span>
          ))}
        </div>

        {/* Style badge — top left */}
        <span className={`plan-card__style-badge plan-card__style-badge--${plan.style?.toLowerCase()}`}>
          {plan.style}
        </span>

        {/* Quick Buy — slides up on hover */}
        <button
          className={`plan-card__quick-buy${inCart || quickBought ? ' plan-card__quick-buy--done' : ''}`}
          onClick={handleQuickBuy}
          aria-label={inCart ? 'View in cart' : 'Quick buy'}
        >
          {inCart ? (
            <><Check size={12} strokeWidth={2.5} /> In Cart</>
          ) : quickBought ? (
            <><Check size={12} strokeWidth={2.5} /> Added!</>
          ) : (
            '+ Quick Buy'
          )}
        </button>
      </div>

      {/* ── Card body ────────────────────────────────────────────── */}
      <div className="plan-card__body">

        {/* Title + price block */}
        <div className="plan-card__header-row">
          <h3 className="plan-card__title">{plan.title}</h3>
          <p className="plan-card__price">{formatTZS(plan.price)}</p>
        </div>

        {/* ── Dual-row spec table ────────────────────────────────── */}
        <div className="plan-card__specs-grid">

          {/* Row 1 — Core structural */}
          <div className="plan-card__spec-row">
            <div className="plan-card__spec-cell">
              <Layers size={14} strokeWidth={1.75} className="plan-card__spec-icon" />
              <span className="plan-card__spec-val">{plan.stories}</span>
              <span className="plan-card__spec-lbl">Floor{plan.stories !== 1 ? 's' : ''}</span>
            </div>
            <div className="plan-card__spec-cell">
              <Bed size={14} strokeWidth={1.75} className="plan-card__spec-icon" />
              <span className="plan-card__spec-val">{plan.bedrooms}</span>
              <span className="plan-card__spec-lbl">Bedrooms</span>
            </div>
            <div className="plan-card__spec-cell">
              <Bath size={14} strokeWidth={1.75} className="plan-card__spec-icon" />
              <span className="plan-card__spec-val">{plan.bathrooms}</span>
              <span className="plan-card__spec-lbl">Bathrooms</span>
            </div>
          </div>

          {/* Row 2 — Plot dimensions */}
          <div className="plan-card__spec-row plan-card__spec-row--plot">
            <div className="plan-card__spec-cell">
              <ArrowLeftRight size={13} strokeWidth={1.75} className="plan-card__spec-icon" />
              <span className="plan-card__spec-val">{dims.width ?? '—'}</span>
              <span className="plan-card__spec-lbl">Width (m)</span>
            </div>
            <div className="plan-card__spec-cell">
              <ArrowUpDown size={13} strokeWidth={1.75} className="plan-card__spec-icon" />
              <span className="plan-card__spec-val">{dims.length ?? '—'}</span>
              <span className="plan-card__spec-lbl">Length (m)</span>
            </div>
            <div className="plan-card__spec-cell">
              <Maximize2 size={13} strokeWidth={1.75} className="plan-card__spec-icon" />
              <span className="plan-card__spec-val">{dims.area ?? '—'}</span>
              <span className="plan-card__spec-lbl">Area (m²)</span>
            </div>
          </div>
        </div>

        {/* Footer: view + cart */}
        <div className="plan-card__footer">
          <Link to={`/plans/${plan.id}`} className="plan-card__detail-btn">
            View Details
          </Link>
          <button
            className={`plan-card__cart-btn${inCart ? ' plan-card__cart-btn--added' : ''}`}
            onClick={handleCart}
            aria-label={inCart ? 'View in cart' : 'Add to cart'}
            title={inCart ? 'View in cart' : 'Add to cart'}
          >
            <ShoppingCart size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </article>
  )
}
