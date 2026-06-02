import { api } from './api.js'

// POST /api/orders  — create an order (authenticated client)
// body: { plan_id, payment_method, phone_number }
export const createOrder = (data) =>
  api.post('/orders', data)

// GET /api/orders/my  — logged-in client's own orders
export const fetchMyOrders = () =>
  api.get('/orders/my')

// GET /api/orders  — all orders (admin only)
export const fetchAllOrders = () =>
  api.get('/orders')

// POST /api/payments/callback  — manual trigger for testing the webhook locally
export const simulatePaymentCallback = (payload) =>
  api.post('/payments/callback', payload)
