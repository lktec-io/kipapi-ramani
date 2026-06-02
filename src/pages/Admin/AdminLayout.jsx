import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, UploadCloud, ClipboardList,
  Building2, LogOut, Menu, X, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import './AdminLayout.css'

const NAV_ITEMS = [
  { to: '/admin',         label: 'Dashboard',     icon: <LayoutDashboard size={18} strokeWidth={1.75} />, end: true  },
  { to: '/admin/upload',  label: 'Upload Plan',   icon: <UploadCloud     size={18} strokeWidth={1.75} />, end: false },
  { to: '/admin/orders',  label: 'Manage Orders', icon: <ClipboardList   size={18} strokeWidth={1.75} />, end: false },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="admin-layout">

      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`admin-sidebar${sidebarOpen ? ' admin-sidebar--open' : ''}`}>

        {/* Brand header */}
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">
            <Building2 size={18} color="#fff" strokeWidth={1.75} />
          </div>
          <div className="admin-sidebar__brand-text">
            <span className="admin-sidebar__brand-name">Kipapi Ramani</span>
            <span className="admin-sidebar__brand-role">Admin Panel</span>
          </div>
          <button
            className="admin-sidebar__close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-nav" aria-label="Admin navigation">
          <p className="admin-nav__section-label">Navigation</p>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-nav__link${isActive ? ' admin-nav__link--active' : ''}`
              }
              onClick={closeSidebar}
            >
              <span className="admin-nav__link-icon">{item.icon}</span>
              <span className="admin-nav__link-label">{item.label}</span>
              <ChevronRight size={14} className="admin-nav__link-arrow" strokeWidth={2} />
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div className="admin-sidebar__spacer" />

        {/* User + Logout */}
        <div className="admin-sidebar__footer">
          <div className="admin-user">
            <div className="admin-user__avatar" aria-hidden="true">
              {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="admin-user__info">
              <span className="admin-user__name">{user?.name || 'Admin'}</span>
              <span className="admin-user__email">{user?.email || ''}</span>
            </div>
          </div>
          <button
            className="admin-logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="admin-main">

        {/* Mobile topbar */}
        <div className="admin-topbar">
          <button
            className="admin-topbar__menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={22} strokeWidth={1.75} />
          </button>
          <span className="admin-topbar__title">Admin Panel</span>
        </div>

        {/* Page content */}
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  )
}
