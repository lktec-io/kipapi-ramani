import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute.jsx'
import AdminRoute  from './AdminRoute.jsx'

import HomePage      from '../pages/Home/index.jsx'
import PlansPage     from '../pages/Plans/index.jsx'
import PlanDetailPage from '../pages/PlanDetail/index.jsx'
import CartPage      from '../pages/Cart/index.jsx'
import CheckoutPage  from '../pages/Checkout/index.jsx'
import AuthPage      from '../pages/Auth/Login.jsx'
import RegisterPage  from '../pages/Auth/Register.jsx'
import DashboardPage from '../pages/Dashboard/index.jsx'
import AdminPage     from '../pages/Admin/index.jsx'

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"          element={<HomePage />} />
      <Route path="/plans"     element={<PlansPage />} />
      <Route path="/plans/:id" element={<PlanDetailPage />} />
      <Route path="/cart"      element={<CartPage />} />
      <Route path="/auth"      element={<AuthPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Authenticated clients */}
      <Route path="/checkout"  element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

      {/* Admin only */}
      <Route path="/admin/*"   element={<AdminRoute><AdminPage /></AdminRoute>} />

      {/* 404 fallback */}
      <Route path="*" element={
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h2>404 — Page not found</h2>
        </div>
      } />
    </Routes>
  )
}
