import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, Building2, LayoutDashboard, LogOut, ShieldCheck, LogIn } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useCart } from '../../../context/CartContext.jsx'
import './Navbar.css'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    logout()
    closeMenu()
    navigate('/')
  }

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
            <NavLink to="/admin"   className={({ isActive }) => `navbar__link navbar__link--admin${isActive ? ' active' : ''}`}>
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

        {/* Hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <nav className="navbar__mobile-menu" aria-label="Mobile navigation">
          <NavLink to="/"      end className="navbar__mobile-link" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/plans"     className="navbar__mobile-link" onClick={closeMenu}>Plans</NavLink>
          <NavLink to="/cart"      className="navbar__mobile-link navbar__mobile-link--cart" onClick={closeMenu}>
            Cart {count > 0 && <span className="navbar__badge navbar__badge--inline">{count}</span>}
          </NavLink>

          <div className="navbar__mobile-divider" />

          {isAuthenticated ? (
            <>
              <NavLink to={isAdmin ? '/admin' : '/dashboard'} className="navbar__mobile-link" onClick={closeMenu}>
                {isAdmin ? 'Admin Panel' : 'My Dashboard'}
              </NavLink>
              <button className="navbar__mobile-link navbar__mobile-link--logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/auth"          className="navbar__mobile-link" onClick={closeMenu}>Login</NavLink>
              <NavLink to="/auth/register" className="navbar__mobile-link" onClick={closeMenu}>Create Account</NavLink>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
