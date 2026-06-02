import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ShieldCheck, Zap, Sliders, BadgeCheck, ArrowRight, Loader2 } from 'lucide-react'
import PlanCard from '../../components/ui/PlanCard/PlanCard.jsx'
import { fetchPlans } from '../../services/plansService.js'
import { mockPlans } from '../../services/mockPlans.js'  // fallback for offline dev
import './Home.css'

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
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlans()
      .then(plans => setFeaturedPlans(plans.slice(0, 3)))
      .catch(() => {
        // Backend offline — fall back to mock data so UI stays functional
        setFeaturedPlans(mockPlans.filter(p => p.featured))
      })
      .finally(() => setPlansLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/plans?search=${encodeURIComponent(q)}` : '/plans')
  }

  return (
    <div className="home">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero">
        {/* Decorative geometric circles */}
        <div className="hero__circle hero__circle--1" aria-hidden="true" />
        <div className="hero__circle hero__circle--2" aria-hidden="true" />
        <div className="hero__circle hero__circle--3" aria-hidden="true" />

        <div className="hero__content">
          <p className="hero__eyebrow">Tanzania's #1 House Plan Marketplace</p>
          <h1 className="hero__headline">
            Pata Ramani ya<br />
            <span className="hero__headline-accent">Ndoto Yako</span>
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
              <Link
                key={tag}
                to={`/plans?search=${encodeURIComponent(tag)}`}
                className="hero__tag"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Hero stats bar */}
        <div className="hero__stats">
          {[
            { value: '100+', label: 'House Plans' },
            { value: '500+', label: 'Happy Clients' },
            { value: '4', label: 'Payment Options' },
            { value: '48h', label: 'Support Response' },
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
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
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
              {featuredPlans.map(plan => (
                <PlanCard key={plan.id} plan={plan} />
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
