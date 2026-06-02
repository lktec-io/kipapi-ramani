import { useState, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Bed, Bath, Layers, Maximize2, Tag, ShoppingCart,
  ChevronRight, Check, ShieldCheck, Zap, Download, Loader2,
} from 'lucide-react'
import { fetchPlan, fetchPlans } from '../../services/plansService.js'
import { mockPlans } from '../../services/mockPlans.js' // offline fallback
import { useCart } from '../../context/CartContext.jsx'
import { formatTZS } from '../../utils/formatters.js'
import PlanCard from '../../components/ui/PlanCard/PlanCard.jsx'
import './PlanDetail.css'

const WM_TILES = Array.from({ length: 36 })

// Build 4 gallery views from a single placehold.co thumbnail URL
const buildGallery = (plan) => {
  const m   = plan.thumbnail_url.match(/\/([0-9a-f]{6})\/([0-9a-f]{6})\?/i)
  const bg  = m?.[1] ?? '1a3c5e'
  const fg  = m?.[2] ?? 'ffffff'
  const b   = `https://placehold.co/800x600/${bg}/${fg}`
  return [
    { url: plan.thumbnail_url.replace('600x450', '800x600'), label: 'Exterior View' },
    { url: `${b}?text=Ground+Floor+Plan`, label: 'Ground Floor' },
    { url: `${b}?text=First+Floor+Plan`,  label: 'First Floor'  },
    { url: `${b}?text=Interior+Render`,   label: 'Interior'     },
  ]
}

const TRUST = [
  { icon: <Download size={14} />, text: 'Instant download — PDF + AutoCAD + Floor sheets' },
  { icon: <ShieldCheck size={14} />, text: 'Engineer-stamped & NEMC / council accepted'   },
  { icon: <Zap size={14} />,         text: 'Secure payment via M-Pesa, Tigo, Airtel, Halo' },
]

export default function PlanDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { addToCart, items } = useCart()

  const [plan,    setPlan]    = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const gallery = useMemo(() => (plan ? buildGallery(plan) : []), [plan])
  const [activeImg, setActiveImg] = useState(0)
  const [btnState,  setBtnState]  = useState('idle') // idle | added

  const inCart = items.some(i => i.id === plan?.id)

  useEffect(() => {
    // Inner async function avoids returning a Promise from the effect callback
    const load = async () => {
      setLoading(true)
      setNotFound(false)
      setPlan(null)
      setActiveImg(0)
      setBtnState('idle')
      window.scrollTo({ top: 0, behavior: 'smooth' })

      try {
        const data = await fetchPlan(id)
        setPlan(data)

        // Fetch related plans — silently fall back to mock on failure
        try {
          const all = await fetchPlans({ style: data.style })
          setRelated(all.filter(p => p.id !== data.id).slice(0, 4))
        } catch {
          setRelated(
            mockPlans
              .filter(p => p.id !== Number(id) && p.style === data.style)
              .slice(0, 4)
          )
        }
      } catch (err) {
        if (err.status === 404) {
          setNotFound(true)
        } else {
          // API offline — fall back to mock data for dev experience
          const fallback = mockPlans.find(p => p.id === Number(id))
          if (fallback) {
            setPlan(fallback)
            setRelated(
              mockPlans
                .filter(p => p.id !== Number(id) && (p.style === fallback.style || p.stories === fallback.stories))
                .slice(0, 4)
            )
          } else {
            setNotFound(true)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const handleCart = () => {
    if (inCart) { navigate('/cart'); return }
    addToCart(plan)
    setBtnState('added')
    setTimeout(() => setBtnState('idle'), 2200)
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="detail-loading">
        <Loader2 size={40} strokeWidth={1.5} className="auth-spinner" />
        <p>Loading plan details…</p>
      </div>
    )
  }

  // ── 404 / not found ──────────────────────────────────────────────────────
  if (notFound || !plan) {
    return (
      <div className="detail-not-found">
        <h2>Plan not found</h2>
        <p>This plan may have been removed or the ID is incorrect.</p>
        <Link to="/plans" className="detail-not-found__link">← Back to Catalogue</Link>
      </div>
    )
  }

  const SPECS = [
    { icon: <Bed size={20} strokeWidth={1.75} />,      label: 'Bedrooms',  value: plan.bedrooms },
    { icon: <Bath size={20} strokeWidth={1.75} />,     label: 'Bathrooms', value: plan.bathrooms },
    { icon: <Layers size={20} strokeWidth={1.75} />,   label: 'Stories',   value: plan.stories === 1 ? 'Bungalow' : `${plan.stories} Floors` },
    { icon: <Maximize2 size={20} strokeWidth={1.75} />,label: 'Plot Size', value: plan.plot_size ?? '—' },
    { icon: <Tag size={20} strokeWidth={1.75} />,      label: 'Style',     value: plan.style },
  ]

  return (
    <div className="plan-detail">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <div className="breadcrumb__inner">
          <Link to="/"      className="breadcrumb__link">Home</Link>
          <ChevronRight size={13} className="breadcrumb__sep" aria-hidden="true" />
          <Link to="/plans" className="breadcrumb__link">Plans</Link>
          <ChevronRight size={13} className="breadcrumb__sep" aria-hidden="true" />
          <span className="breadcrumb__current" aria-current="page">{plan.title}</span>
        </div>
      </nav>

      {/* ── Two-column main ─────────────────────────────────────────────── */}
      <div className="detail-grid">

        {/* LEFT — Image gallery */}
        <div className="detail-gallery">

          {/* Main image */}
          <div className="detail-gallery__main">
            <img
              key={`${id}-${activeImg}`}       /* key forces re-mount → re-triggers fade-in */
              src={gallery[activeImg].url}
              alt={`${plan.title} — ${gallery[activeImg].label}`}
              className="detail-gallery__img"
            />
            {/* 45° tiled watermark */}
            <div className="detail-gallery__watermark" aria-hidden="true">
              {WM_TILES.map((_, i) => (
                <span key={i} className="detail-gallery__wm-text">KIPAPI RAMANI PRO</span>
              ))}
            </div>
            <span className="detail-gallery__view-badge">{gallery[activeImg].label}</span>
          </div>

          {/* Thumbnail strip */}
          <div className="detail-gallery__thumbs" role="list" aria-label="Gallery views">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                role="listitem"
                className={`detail-gallery__thumb${activeImg === idx ? ' detail-gallery__thumb--active' : ''}`}
                onClick={() => setActiveImg(idx)}
                aria-label={`View ${img.label}`}
                aria-pressed={activeImg === idx}
              >
                <img
                  src={img.url.replace('800x600', '200x150')}
                  alt={img.label}
                  loading="lazy"
                />
                <span className="detail-gallery__thumb-label">{img.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — Plan info */}
        <div className="detail-info">

          <span className={`detail-style-badge detail-style-badge--${plan.style.toLowerCase()}`}>
            {plan.style}
          </span>

          <h1 className="detail-title">{plan.title}</h1>
          <p className="detail-desc">{plan.description}</p>

          {/* Specs grid */}
          <div className="detail-specs" role="list" aria-label="Plan specifications">
            {SPECS.map(s => (
              <div key={s.label} className="detail-spec" role="listitem">
                <div className="detail-spec__icon">{s.icon}</div>
                <div className="detail-spec__text">
                  <span className="detail-spec__value">{s.value}</span>
                  <span className="detail-spec__label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Price block */}
          <div className="detail-price-block">
            <div className="detail-price-row">
              <span className="detail-price-label">Plan Price</span>
              <span className="detail-price">{formatTZS(plan.price)}</span>
            </div>
            <p className="detail-price-note">One-time purchase · No subscription · Lifetime access</p>
          </div>

          {/* CTA */}
          <button
            className={`detail-cart-btn${inCart ? ' detail-cart-btn--in-cart' : ''}${btnState === 'added' ? ' detail-cart-btn--pulse' : ''}`}
            onClick={handleCart}
            aria-live="polite"
          >
            {btnState === 'added' ? (
              <><Check size={20} strokeWidth={2.5} /> Added! View Cart</>
            ) : inCart ? (
              <><ShoppingCart size={20} strokeWidth={1.75} /> View in Cart</>
            ) : (
              <><ShoppingCart size={20} strokeWidth={1.75} /> Add to Cart</>
            )}
          </button>

          {/* Trust checklist */}
          <ul className="detail-trust" aria-label="Purchase assurances">
            {TRUST.map((t, i) => (
              <li key={i} className="detail-trust__item">
                <span className="detail-trust__icon">{t.icon}</span>
                {t.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── You May Also Like ────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="related" aria-label="Recommended plans">
          <div className="related__inner">
            <div className="related__head">
              <div>
                <p className="related__eyebrow">Recommended</p>
                <h2 className="related__title">You May Also Like</h2>
              </div>
              <Link to="/plans" className="related__see-all">
                Browse all plans <ChevronRight size={15} />
              </Link>
            </div>
            <div className="related__scroll">
              {related.map(p => (
                <div key={p.id} className="related__card">
                  <PlanCard plan={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
