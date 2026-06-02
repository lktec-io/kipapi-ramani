import { Link } from 'react-router-dom'
import { TrendingUp, LayoutGrid, Download, ArrowRight, UploadCloud, ClipboardList } from 'lucide-react'
import { mockOrders } from '../../../services/mockOrders.js'
import { mockPlans }  from '../../../services/mockPlans.js'
import { formatTZS, formatDate } from '../../../utils/formatters.js'
import './AdminDashboard.css'

// ── Computed analytics ──────────────────────────────────────────────────────
const paidOrders   = mockOrders.filter(o => o.payment_status === 'paid')
const totalRevenue = paidOrders.reduce((s, o) => s + o.total_amount, 0)
const totalPlans   = mockPlans.length
const totalDownloads = paidOrders.length  // 1 download per paid order (simplification)

const recentOrders = [...mockOrders]
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  .slice(0, 5)

const STATUS_META = {
  paid:    { label: 'Paid',       cls: 'badge--paid'    },
  pending: { label: 'Processing', cls: 'badge--pending' },
  failed:  { label: 'Failed',     cls: 'badge--failed'  },
}

const STATS = [
  {
    label:  'Total Revenue',
    value:  formatTZS(totalRevenue),
    sub:    `From ${paidOrders.length} completed orders`,
    icon:   <TrendingUp size={22} strokeWidth={1.75} />,
    color:  'stat--revenue',
  },
  {
    label:  'Active Plans',
    value:  totalPlans,
    sub:    'Plans listed in catalogue',
    icon:   <LayoutGrid size={22} strokeWidth={1.75} />,
    color:  'stat--plans',
  },
  {
    label:  'Downloads Issued',
    value:  totalDownloads,
    sub:    'Secure file deliveries completed',
    icon:   <Download size={22} strokeWidth={1.75} />,
    color:  'stat--downloads',
  },
]

const QUICK_ACTIONS = [
  { to: '/admin/upload', icon: <UploadCloud size={18} strokeWidth={1.75} />,  label: 'Upload New Plan', primary: true },
  { to: '/admin/orders', icon: <ClipboardList size={18} strokeWidth={1.75} />, label: 'Manage Orders',   primary: false },
]

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">

      {/* Page title */}
      <div className="admin-page-header">
        <div>
          <p className="admin-page-header__eyebrow">Overview</p>
          <h1 className="admin-page-header__title">Dashboard</h1>
        </div>
        <div className="admin-quick-actions">
          {QUICK_ACTIONS.map(a => (
            <Link
              key={a.to}
              to={a.to}
              className={`admin-quick-btn${a.primary ? ' admin-quick-btn--primary' : ''}`}
            >
              {a.icon} {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Stats grid ──────────────────────────────────────────────────── */}
      <div className="stats-grid">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`stat-card ${s.color}`}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className="stat-card__icon-wrap">{s.icon}</div>
            <div className="stat-card__body">
              <span className="stat-card__value">{s.value}</span>
              <span className="stat-card__label">{s.label}</span>
              <span className="stat-card__sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent activity table ────────────────────────────────────────── */}
      <div className="admin-section">
        <div className="admin-section__head">
          <h2 className="admin-section__title">Recent Transactions</h2>
          <Link to="/admin/orders" className="admin-section__see-all">
            View all <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead className="admin-table__head">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Plan</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => {
                const st = STATUS_META[order.payment_status] || STATUS_META.pending
                return (
                  <tr
                    key={order.id}
                    className="admin-table__row"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <td className="admin-table__id">{order.id}</td>
                    <td>
                      <div className="admin-table__customer">
                        <div className="admin-table__avatar">
                          {order.user_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="admin-table__customer-info">
                          <span className="admin-table__customer-name">{order.user_name}</span>
                          <span className="admin-table__customer-email">{order.user_email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="admin-table__plan">{order.plan_title}</td>
                    <td className="admin-table__date">{formatDate(order.created_at)}</td>
                    <td className="admin-table__method">{order.payment_method}</td>
                    <td>
                      <span className={`order-badge ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="admin-table__amount">{formatTZS(order.total_amount)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
