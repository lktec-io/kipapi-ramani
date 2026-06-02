import { Router } from 'express'
import { handlePaymentCallback } from '../controllers/paymentController.js'

const router = Router()

// POST /api/payments/callback
// Called by payment gateways (Flutterwave, Selcom, Azam Pay, Pesapal, DPO, etc.)
// This endpoint is intentionally public — the gateway authenticates via HMAC signature
// which is verified inside the controller.
router.post('/callback', handlePaymentCallback)

export default router
