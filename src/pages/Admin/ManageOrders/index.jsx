import { useState, useMemo } from 'react'
import { CheckCircle2, Clock, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react'
import { mockOrders as initial } from '../../../services/mockOrders.js'
import { formatTZS, formatDate } from '../../../utils/formatters.js'
import './ManageOrders.css'

const FILTERS = [
  { key: 'all',     label: 'All Orders' },
  { key: 'paid',    label: 'Paid'        },
  { key: 'pending', label: 'Processing'  },
  { key: 'failed',  label: 'Failed'      },
]

const STATUS_META = {
  paid:    { icon: <CheckCircle2 size={13} strokeWidth={2} />, label: 'Paid',       cls: 'badge--paid'    },
  pending: { icon: <Clock        size={13} strokeWidth={2} />, label: 'Processing', cls: 'badge--pending' },
  failed:  { icon: <AlertCircle  size={13} strokeWidth={2} />, label: 'Failed',     cls: 'badge--failed'  },
}

export default function ManageOrders() {
  const [orders,       setOrders]       = useState(initial)
  const [filter,       setFilter]       = useState('all')
  const [verifying,    setVerifying]    = useState(null)   // order ID being verified
  const [verified,     setVerified]     = useState([])     // IDs just verified (for flash)

  const filtered = useMemo(() =>
    filter === 'all' ? orders : orders.filter(o => o.payment_status === filter),
    [orders, filter]
  )

  const counts = useMemo(() => ({
    all:     orders.length,
    paid:    orders.filter(o => o.payment_status === 'paid').length,
    pending: orders.filter(o => o.payment_status === 'pending').length,
    failed:  orders.filter(o => o.payment_status === 'failed').length,
  }), [orders])

  const totalRevenue = orders
    .filter(o => o.payment_status === 'paid')
    .reduce((s, o) => s + o.total_amount, 0)

  const handleVerify = async (orderId) => {
    setVerifying(orderId)
    await new Promise(r => setTimeout(r, 1500))
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, payment_status: 'paid' } : o
    ))
    setVerified(prev => [...prev, orderId])
    setVerifying(null)
    // Remove flash after 3s
    setTimeout(() => setVerified(prev => prev.filter(id => id !== orderId)), 3000)
  }

  return (
    <div className="orders-page">

      <div className="admin-page-header">
        <div>
          <p className="admin-page-header__eyebrow">Transaction Log</p>
          <h1 className="admin-page-header__title">Manage Orders</h1>
        </div>
        <div className="orders-summary-pill">
          <ShieldCheck size={15} strokeWidth={1.75} />
          Total Revenue: <strong>{formatTZS(totalRevenue)}</strong>
        </div>
      </div>

      {/* ── Filter chips ──────────────────────────────────────────────────── */}
      <div className="orders-filters">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`orders-filter-chip${filter === f.key ? ' orders-filter-chip--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="orders-filter-count">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {/* ── Orders table ──────────────────────────────────────────────────── */}
      <div className="admin-section" style={{ marginTop: 0 }}>
        <div className="admin-section__head">
          <h2 className="admin-section__title">
            {filtered.length} order{filtered.length !== 1 ? 's' : ''}
            {filter !== 'all' && ` · ${FILTERS.find(f => f.key === filter)?.label}`}
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="orders-empty">
            <p>No orders match the selected filter.</p>
            <button className="orders-reset-btn" onClick={() => setFilter('all')}>Show all orders</button>
          </div>
        ) : (
          <div className="orders-table-wrap">
            <table className="admin-table orders-table">
              <thead className="admin-table__head">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const st       = STATUS_META[order.payment_status] || STATUS_META.pending
                  const isVerify = verifying === order.id
                  const wasVerified = verified.includes(order.id)

                  return (
                    <tr
                      key={order.id}
                      className={`admin-table__row${wasVerified ? ' admin-table__row--verified' : ''}`}
                      style={{ animationDelay: `${i * 0.05}s` }}
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
                      <td className="admin-table__amount">{formatTZS(order.total_amount)}</td>

                      <td>
                        <span className={`order-badge ${st.cls}`}>
                          {st.icon} {st.label}
                        </span>
                      </td>

                      <td>
                        {order.payment_status === 'pending' ? (
                          <button
                            className="verify-btn"
                            onClick={() => handleVerify(order.id)}
                            disabled={isVerify}
                            title="Mark this order as paid (simulate webhook confirmation)"
                          >
                            {isVerify
                              ? <><RefreshCw size={13} className="auth-spinner" /> Verifying…</>
                              : <><ShieldCheck size={13} strokeWidth={2} /> Verify Payment</>
                            }
                          </button>
                        ) : wasVerified ? (
                          <span className="verify-confirmed">
                            <CheckCircle2 size={14} strokeWidth={2} /> Confirmed!
                          </span>
                        ) : (
                          <span className="verify-na">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
