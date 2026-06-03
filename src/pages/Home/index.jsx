import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ShieldCheck, Zap, Sliders, BadgeCheck, ArrowRight, Loader2 } from 'lucide-react'
import PlanCard from '../../components/ui/PlanCard/PlanCard.jsx'
import { fetchPlans } from '../../services/plansService.js'
import { mockPlans } from '../../services/mockPlans.js'
import './Home.css'

// ── Hero slideshow config ───────────────────────────────────────────────────
// Replace image URLs with real architectural renders when available.
const HERO_SLIDES = [
  {
    keyword: 'Modern Homes',
    image:   'https://placehold.co/1440x900/0d2139/f97316?text=Modern+Villa+Design',
  },
  {
    keyword: 'Bungalows',
    image:   'https://placehold.co/1440x900/4e342e/ffcc80?text=Classic+Bungalow',
  },
  {
    keyword: 'Luxury Villas',
    image:   'https://placehold.co/1440x900/1a237e/90caf9?text=Luxury+Villa',
  },
  {
    keyword: 'Affordable Plans',
    image:   'https://placehold.co/1440x900/004d40/a5d6a7?text=Starter+Home',
  },
]
const SLIDE_INTERVAL = 5500 // ms

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
  const [slideIndex,    setSlideIndex]    = useState(0)
  const [paused,        setPaused]        = useState(false)
  const timerRef = useRef(null)
  const navigate = useNavigate()

  // ── Fetch featured plans ──────────────────────────────────────────────────
  useEffect(() => {
    fetchPlans()
      .then(plans => setFeaturedPlans(plans.slice(0, 3)))
      .catch(() => setFeaturedPlans(mockPlans.filter(p => p.featured)))
      .finally(() => setPlansLoading(false))
  }, [])

  // ── Auto-advance slideshow ────────────────────────────────────────────────
  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(() => {
      setSlideIndex(i => (i + 1) % HERO_SLIDES.length)
    }, SLIDE_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [paused])

  const goToSlide = (i) => {
    clearInterval(timerRef.current)
    setSlideIndex(i)
    // Restart auto-advance after manual select
    if (!paused) {
      timerRef.current = setInterval(
        () => setSlideIndex(prev => (prev + 1) % HERO_SLIDES.length),
        SLIDE_INTERVAL
      )
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/plans?search=${encodeURIComponent(q)}` : '/plans')
  }

  return (
    <div className="home">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="hero"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Slideshow images */}
        <div className="hero__slides" aria-hidden="true">
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`hero__slide${slideIndex === i ? ' hero__slide--active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}
        </div>

        {/* Dark gradient overlay — keeps text readable over any image */}
        <div className="hero__overlay" aria-hidden="true" />

        {/* Decorative glow circles */}
        <div className="hero__circle hero__circle--1" aria-hidden="true" />
        <div className="hero__circle hero__circle--2" aria-hidden="true" />
        <div className="hero__circle hero__circle--3" aria-hidden="true" />

        {/* Main content */}
        <div className="hero__content">
          <p className="hero__eyebrow">Tanzania's #1 House Plan Marketplace</p>

          <h1 className="hero__headline">
            Pata Ramani ya
            {/* key forces re-mount → re-triggers keywordEnter CSS animation */}
            <span key={slideIndex} className="hero__keyword">
              {HERO_SLIDES[slideIndex].keyword}
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

          {/* Quick filter tags */}
          <div className="hero__quick-tags">
            {['3-Bedroom', '4-Bedroom', 'Modern', 'Bungalow', 'Double-Storey'].map(tag => (
              <Link key={tag} to={`/plans?search=${encodeURIComponent(tag)}`} className="hero__tag">
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Slide dot indicators */}
        <div className="hero__dots" role="tablist" aria-label="Hero slides">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={slideIndex === i}
              aria-label={`View slide ${i + 1}: ${HERO_SLIDES[i].keyword}`}
              className={`hero__dot${slideIndex === i ? ' hero__dot--active' : ''}`}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>

        {/* Stats bar */}
        <div className="hero__stats">
          {[
            { value: '100+', label: 'House Plans' },
            { value: '500+', label: 'Happy Clients' },
            { value: '4',    label: 'Payment Options' },
            { value: '48h',  label: 'Support Response' },
          ].map(stat => (
            <div key={stat.label} className="hero__stat">
              <span className="hero__stat-value">{stat.value}</span>
              <span className="hero__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
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
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Plans ────────────────────────────────────────────────── */}
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
                  style={{ '--stagger-delay': `${i * 100}ms` }}
                >
                  <PlanCard plan={plan} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
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
