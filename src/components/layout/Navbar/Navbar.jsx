import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Menu, X, Building2,
  LayoutDashboard, LogOut, ShieldCheck, LogIn, ChevronDown, User,
} from 'lucide-react'
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useCart } from '../../../context/CartContext.jsx'
import './Navbar.css'

// ── Mobile drawer navigation config ─────────────────────────────────────────
const DRAWER_NAV = [
  {
    label: 'Shop',
    type:  'link',
    to:    '/plans',
  },
  {
    label: 'Best Sellers',
    type:  'link',
    to:    '/plans?sort=newest',
  },
  {
    label: 'By Size',
    type:  'dropdown',
    items: [
      { label: 'Studio (< 100 m²)',    to: '/plans?search=studio'  },
      { label: 'Small (100–200 m²)',   to: '/plans?search=small'   },
      { label: 'Medium (200–400 m²)',  to: '/plans?search=medium'  },
      { label: 'Large (400+ m²)',      to: '/plans?search=large'   },
    ],
  },
  {
    label: 'By Style',
    type:  'dropdown',
    items: [
      { label: 'Modern',       to: '/plans?style=Modern'       },
      { label: 'Contemporary', to: '/plans?style=Contemporary' },
      { label: 'Traditional',  to: '/plans?style=Traditional'  },
    ],
  },
  {
    label: 'By Budget',
    type:  'dropdown',
    items: [
      { label: 'Under TSh 1M', to: '/plans?maxPrice=1000000' },
      { label: 'TSh 1M – 2M',  to: '/plans?maxPrice=2000000' },
      { label: 'Premium',      to: '/plans'                  },
    ],
  },
  {
    label: 'Custom Plan',
    type:  'external',
    href:  'mailto:info@kipapi.co.tz',
  },
  {
    label: 'Learn',
    type:  'link',
    to:    '/',
  },
]

const SOCIAL_LINKS = [
  { Icon: FaFacebook,   href: '#', label: 'Facebook'   },
  { Icon: FaTwitter,    href: '#', label: 'X / Twitter' },
  { Icon: FaInstagram,  href: '#', label: 'Instagram'   },
  { Icon: FaPinterest,  href: '#', label: 'Pinterest'   },
  { Icon: FaLinkedinIn, href: '#', label: 'LinkedIn'    },
  { Icon: FaWhatsapp,   href: '#', label: 'WhatsApp'    },
]

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { count }  = useCart()
  const navigate   = useNavigate()

  const [menuOpen,     setMenuOpen]     = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null) // tracks which nested dropdown is open

  // ── Scroll shadow ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Lock body scroll when drawer is open ───────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // ── Close drawer on route change (escape key) ──────────────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeMenu() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const closeMenu = () => {
    setMenuOpen(false)
    setOpenDropdown(null)
  }

  const handleLogout = () => {
    logout()
    closeMenu()
    navigate('/')
  }

  const toggleDropdown = (label) =>
    setOpenDropdown(prev => (prev === label ? null : label))

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">

        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <div className="navbar__logo-icon">
            <Building2 size={18} color="#fff" strokeWidth={1.75} />
          </div>
          <div className="navbar__logo-text">
            <span className="navbar__logo-title">Kipapi Ramani</span>
            <span className="navbar__logo-tagline">House Plans</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="navbar__links" aria-label="Main navigation">
          <NavLink to="/"      end className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Home</NavLink>
          <NavLink to="/plans"     className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Plans</NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `navbar__link navbar__link--admin${isActive ? ' active' : ''}`}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Desktop actions */}
        <div className="navbar__actions">
          <Link to="/cart" className="navbar__cart-btn" aria-label={`Cart, ${count} items`}>
            <ShoppingCart size={20} strokeWidth={1.75} />
            {count > 0 && <span className="navbar__badge">{count > 9 ? '9+' : count}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="navbar__user-menu">
              <span className="navbar__user-name">{user?.name?.split(' ')[0]}</span>
              <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar__auth-btn">
                {isAdmin
                  ? <><ShieldCheck size={15} /><span>Admin</span></>
                  : <><LayoutDashboard size={15} /><span>Dashboard</span></>
                }
              </Link>
              <button className="navbar__logout-btn" onClick={handleLogout} aria-label="Logout">
                <LogOut size={16} strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="navbar__auth-btn">
              <LogIn size={15} />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Hamburger (mobile only) */}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen
            ? <X    size={22} strokeWidth={1.75} />
            : <Menu size={22} strokeWidth={1.75} />
          }
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          FULL-SCREEN MOBILE DRAWER
          ══════════════════════════════════════════════════════════════════════ */}

      {/* Dark backdrop — click to close */}
      <div
        className={`drawer-overlay${menuOpen ? ' drawer-overlay--visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Drawer panel — slides in from the left */}
      <aside
        className={`drawer${menuOpen ? ' drawer--open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        {/* Drawer header */}
        <div className="drawer__header">
          <Link to="/" className="navbar__logo" onClick={closeMenu}>
            <div className="navbar__logo-icon">
              <Building2 size={16} color="#fff" strokeWidth={1.75} />
            </div>
            <div className="navbar__logo-text">
              <span className="navbar__logo-title">Kipapi Ramani</span>
              <span className="navbar__logo-tagline">House Plans</span>
            </div>
          </Link>
          <button className="drawer__close" onClick={closeMenu} aria-label="Close menu">
            <X size={22} strokeWidth={1.75} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="drawer__nav">
          {DRAWER_NAV.map(item => (
            <div key={item.label}>
              {/* Plain link */}
              {item.type === 'link' && (
                <Link
                  to={item.to}
                  className="drawer__nav-item"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              )}

              {/* External / mailto link */}
              {item.type === 'external' && (
                <a
                  href={item.href}
                  className="drawer__nav-item"
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              )}

              {/* Dropdown toggle */}
              {item.type === 'dropdown' && (
                <>
                  <button
                    className={`drawer__nav-item drawer__nav-item--dropdown${openDropdown === item.label ? ' drawer__nav-item--open' : ''}`}
                    onClick={() => toggleDropdown(item.label)}
                    type="button"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={18}
                      strokeWidth={2.2}
                      className="drawer__chevron"
                    />
                  </button>

                  {openDropdown === item.label && (
                    <div className="drawer__dropdown" role="region">
                      {item.items.map(sub => (
                        <Link
                          key={sub.label}
                          to={sub.to}
                          className="drawer__dropdown-item"
                          onClick={closeMenu}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Spacer pushes footer to bottom */}
        <div className="drawer__spacer" />

        {/* Drawer footer — social icons + account link */}
        <div className="drawer__footer">
          {/* Social icons row */}
          <div className="drawer__social" aria-label="Social media links">
            {SOCIAL_LINKS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                className="drawer__social-link"
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>

          {/* Account link */}
          {isAuthenticated ? (
            <button className="drawer__account-link" onClick={handleLogout} type="button">
              <LogOut size={15} />
              Logout
            </button>
          ) : (
            <Link to="/auth" className="drawer__account-link" onClick={closeMenu}>
              <User size={15} />
              Account
            </Link>
          )}
        </div>
      </aside>
    </header>
  )
}
