import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ShieldCheck, Zap, Sliders, BadgeCheck, ArrowRight, Loader2 } from 'lucide-react'
import PlanCard from '../../components/ui/PlanCard/PlanCard.jsx'
import { fetchPlans } from '../../services/plansService.js'
import { mockPlans } from '../../services/mockPlans.js'
import './Home.css'

// ── Text carousel — cycles every 3.5 s ─────────────────────────────────────
const HEADLINES = [
  'Modern Homes',
  'Affordable Bungalows',
  'Luxury Apartments',
  'Contemporary Layouts',
]

// ── Image carousel — cycles every 4 s ──────────────────────────────────────
// Swap these URLs for real architectural renders when available.
const HERO_IMAGES = [
  'https://placehold.co/1440x900/0d2139/f97316?text=Modern+Villa+Design',
  'https://placehold.co/1440x900/4e342e/ffcc80?text=Affordable+Bungalow',
  'https://placehold.co/1440x900/1a237e/90caf9?text=Luxury+Apartment',
  'https://placehold.co/1440x900/004d40/a5d6a7?text=Contemporary+Layout',
]

const FEATURES = [
  {
    icon: <Zap size={26} strokeWidth={1.75} />,
    title: 'Instant Delivery',
    desc: 'Download your full plan package — PDF, AutoCAD, and floor plan sheets — immediately after payment clears.',
  },
  {
    icon: <ShieldCheck size={26} strokeWidth={1.75} />,
    title: 'Malipo Salama',
    desc: 'Pay securely via M-Pesa, Tigo Pesa, Airtel, or Halo. All transactions are end-to-end encrypted.',
  },
  {
    icon: <Sliders size={26} strokeWidth={1.75} />,
    title: 'Custom Modifications',
    desc: 'Need changes to the layout? Our architects can modify any plan to match your specific site and family needs.',
  },
  {
    icon: <BadgeCheck size={26} strokeWidth={1.75} />,
    title: 'Engineer-Verified',
    desc: 'Every plan is reviewed and stamped by a registered Tanzanian engineer — accepted by NEMC and local councils.',
  },
]

export default function HomePage() {
  const [query,         setQuery]         = useState('')
  const [featuredPlans, setFeaturedPlans] = useState([])
  const [plansLoading,  setPlansLoading]  = useState(true)

  // Two independent carousel indices with separate timers
  const [textIndex, setTextIndex] = useState(0)
  const [imgIndex,  setImgIndex]  = useState(0)

  const navigate = useNavigate()

  // ── Fetch featured plans (3 most-recent) ─────────────────────────────────
  useEffect(() => {
    fetchPlans()
      .then(plans => setFeaturedPlans(plans.slice(0, 3)))
      .catch(() => setFeaturedPlans(mockPlans.filter(p => p.featured)))
      .finally(() => setPlansLoading(false))
  }, [])

  // ── Text carousel: 3.5 s — completely independent from images ────────────
  useEffect(() => {
    const id = setInterval(() => {
      setTextIndex(prev => (prev + 1) % HEADLINES.length)
    }, 3500)
    return () => clearInterval(id)
  }, []) // [] — fires once on mount, cleans up on unmount

  // ── Image carousel: 4 s — independent timer ───────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setImgIndex(prev => (prev + 1) % HERO_IMAGES.length)
    }, 4000)
    return () => clearInterval(id)
  }, []) // [] — fires once on mount, cleans up on unmount

  const handleSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/plans?search=${encodeURIComponent(q)}` : '/plans')
  }

  return (
    <div className="home">

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="hero">

        {/* Background image layers — cross-fade controlled by imgIndex */}
        <div className="hero__slides" aria-hidden="true">
          {HERO_IMAGES.map((src, i) => (
            <div
              key={i}
              className={`hero__slide${imgIndex === i ? ' hero__slide--active' : ''}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>

        {/* Semi-transparent overlay — text always readable */}
        <div className="hero__overlay" aria-hidden="true" />

        {/* Decorative glow circles */}
        <div className="hero__circle hero__circle--1" aria-hidden="true" />
        <div className="hero__circle hero__circle--2" aria-hidden="true" />
        <div className="hero__circle hero__circle--3" aria-hidden="true" />

        {/* ── Hero copy ──────────────────────────────────────────────────── */}
        <div className="hero__content">

          <p className="hero__eyebrow" aria-label="Tanzania's number one house plan marketplace">
            Tanzania's #1 House Plan Marketplace
          </p>

          <h1 className="hero__headline">
            Pata Ramani ya
            {/*
              key={textIndex} forces React to unmount + remount this span
              on every interval tick, which re-triggers the slideUpFade
              CSS animation — no JS animation library needed.
            */}
            <span key={textIndex} className="hero__keyword" aria-live="polite">
              {HEADLINES[textIndex]}
            </span>
          </h1>

          <p className="hero__subtext">
            Browse 100+ professionally designed, engineer-verified house plans.
            Buy, download, and build — all in one place.
          </p>

          {/* Search bar */}
          <form className="hero__search" onSubmit={handleSearch} role="search">
            <div className="hero__search-inner">
              <Search size={18} className="hero__search-icon" strokeWidth={1.75} />
              <input
                type="search"
                className="hero__search-input"
                placeholder="Search by name, style, or bedrooms…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search house plans"
              />
              <button type="submit" className="hero__search-btn">
                Search Plans
              </button>
            </div>
          </form>

          {/* Quick filter tag pills */}
          <div className="hero__quick-tags">
            {['3-Bedroom', '4-Bedroom', 'Modern', 'Bungalow', 'Double-Storey'].map(tag => (
              <Link key={tag} to={`/plans?search=${encodeURIComponent(tag)}`} className="hero__tag">
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Image carousel dot indicators */}
        <div className="hero__dots" role="group" aria-label="Background slide indicators">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              aria-current={imgIndex === i ? 'true' : 'false'}
              className={`hero__dot${imgIndex === i ? ' hero__dot--active' : ''}`}
              onClick={() => setImgIndex(i)}
            />
          ))}
        </div>

        {/* Stats bar */}
        <div className="hero__stats">
          {[
            { value: '100+', label: 'House Plans'     },
            { value: '500+', label: 'Happy Clients'   },
            { value: '4',    label: 'Payment Options' },
            { value: '48h',  label: 'Support Response'},
          ].map(stat => (
            <div key={stat.label} className="hero__stat">
              <span className="hero__stat-value">{stat.value}</span>
              <span className="hero__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURES
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="home-section features-section">
        <div className="home-section__inner">
          <div className="section-header">
            <p className="section-header__eyebrow">Why Kipapi Ramani</p>
            <h2 className="section-header__title">Built for Tanzanian Builders</h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-card"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURED PLANS
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="home-section plans-section">
        <div className="home-section__inner">
          <div className="section-header section-header--row">
            <div>
              <p className="section-header__eyebrow">Hand-Picked</p>
              <h2 className="section-header__title">Featured Plans</h2>
            </div>
            <Link to="/plans" className="section-header__cta">
              View All Plans <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>

          {plansLoading ? (
            <div className="featured-plans-loading">
              <Loader2 size={32} strokeWidth={1.5} className="auth-spinner" />
            </div>
          ) : (
            <div className="featured-plans-grid">
              {featuredPlans.map((plan, i) => (
                <div
                  key={plan.id}
                  className="featured-plan-item"
                  style={{ '--stagger-delay': `${i * 110}ms` }}
                >
                  <PlanCard plan={plan} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA BANNER
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="cta-banner">
        <div className="cta-banner__inner">
          <div className="cta-banner__text">
            <h2 className="cta-banner__title">Can't find the right plan?</h2>
            <p className="cta-banner__sub">
              Our architects can design a fully custom plan for your plot and budget.
            </p>
          </div>
          <a href="mailto:info@kipapi.co.tz" className="cta-banner__btn">
            Request Custom Plan
          </a>
        </div>
      </section>

    </div>
  )
}
