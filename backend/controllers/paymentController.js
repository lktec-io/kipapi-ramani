import crypto from 'crypto'
import * as Order    from '../models/orderModel.js'
import * as Download from '../models/downloadModel.js'

// ── Payload normalizer ────────────────────────────────────────────────────────
// Each Tanzanian / African payment processor sends different field names.
// This maps every known format to { reference, gatewayRef, status }.
//
//  reference  — the merchant order reference we sent to the gateway (our order ID)
//  gatewayRef — the gateway's own transaction ID (stored for reconciliation)
//  status     — 'paid' | 'failed' | 'pending_verification'
//
const normalizePayload = (body) => {
  // ── Flutterwave ──────────────────────────────────────────────────────────
  if (body.data?.tx_ref !== undefined) {
    const d = body.data
    return {
      reference:  String(d.tx_ref),
      gatewayRef: d.flw_ref ?? d.id,
      status:     d.status === 'successful' ? 'paid' : 'failed',
    }
  }

  // ── Selcom Mobile (Tanzania) ─────────────────────────────────────────────
  if (body.utilityref !== undefined) {
    return {
      reference:  String(body.utilityref),
      gatewayRef: body.transid,
      status:     body.resultcode === '000' ? 'paid' : 'failed',
    }
  }

  // ── Azam Pay (Tanzania) ──────────────────────────────────────────────────
  if (body.referenceId !== undefined && body.message !== undefined) {
    return {
      reference:  String(body.referenceId),
      gatewayRef: body.referenceId,
      status:     body.message === '000' || body.status === 'success' ? 'paid' : 'failed',
    }
  }

  // ── Pesapal IPN (reference is set, but status requires a follow-up API query) ─
  if (body.pesapal_merchant_reference !== undefined) {
    return {
      reference:  String(body.pesapal_merchant_reference),
      gatewayRef: body.pesapal_transaction_tracking_id ?? null,
      // Pesapal IPN only notifies of a *change* — actual status must be
      // queried via Pesapal's IPN status API. We mark as 'pending_verification'
      // and let the cron job or a follow-up reconcile it.
      status: 'pending_verification',
    }
  }

  // ── DPO Pay / PayGate ────────────────────────────────────────────────────
  if (body.TransactionToken !== undefined) {
    return {
      reference:  String(body.CompanyRef),
      gatewayRef: body.TransactionToken,
      status:     body.Result === '000' ? 'paid' : 'failed',
    }
  }

  // ── Generic / manual (test payloads, internal tools) ────────────────────
  if (body.reference !== undefined || body.order_id !== undefined) {
    const s = String(body.status ?? '').toLowerCase()
    return {
      reference:  String(body.reference ?? body.order_id),
      gatewayRef: body.gateway_ref ?? body.payment_reference ?? null,
      status:     ['paid', 'success', 'successful', 'completed'].includes(s)
        ? 'paid'
        : s === 'failed' || s === 'error'
        ? 'failed'
        : 'pending_verification',
    }
  }

  throw new Error('Unrecognized payment payload format — no known reference field found.')
}

// ── HMAC signature verifier ───────────────────────────────────────────────────
// Many gateways send an X-Webhook-Signature header.
// Only enforce verification in production and when PAYMENT_API_SECRET is set.
const verifySignature = (req) => {
  const secret = process.env.PAYMENT_API_SECRET
  if (!secret || process.env.NODE_ENV !== 'production') return true // skip in dev

  const signature = req.headers['x-webhook-signature']
    ?? req.headers['x-flutterwave-signature']
    ?? req.headers['x-selcom-signature']
  if (!signature) return false

  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex')

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

// ── Main webhook handler ──────────────────────────────────────────────────────
export const handlePaymentCallback = async (req, res, next) => {
  try {
    // Always respond quickly — gateways will retry if we time out
    if (!verifySignature(req)) {
      console.warn('[WEBHOOK] Invalid signature — payload rejected')
      return res.status(401).json({ received: false, error: 'Invalid signature' })
    }

    console.log('[WEBHOOK] Raw payload:', JSON.stringify(req.body))

    let normalized
    try {
      normalized = normalizePayload(req.body)
    } catch (e) {
      console.warn('[WEBHOOK] Normalization failed:', e.message)
      return res.status(422).json({ received: false, error: e.message })
    }

    const { reference, gatewayRef, status } = normalized
    console.log(`[WEBHOOK] Normalized → ref=${reference} gw=${gatewayRef} status=${status}`)

    // reference stores our internal order ID (e.g. "142" or "ORD-142")
    const orderId = String(reference).replace(/[^0-9]/g, '')
    if (!orderId) {
      return res.status(422).json({ received: false, error: 'Cannot extract order ID from reference' })
    }

    const order = await Order.getOrderById(Number(orderId))
    if (!order) {
      // Acknowledge receipt so the gateway doesn't retry indefinitely
      console.warn(`[WEBHOOK] Order ${orderId} not found`)
      return res.json({ received: true, note: 'Order not found — acknowledged to prevent retry' })
    }

    // Idempotency guard — don't process an already-paid order twice
    if (order.payment_status === 'paid') {
      console.log(`[WEBHOOK] Order ${orderId} already marked paid — skipping`)
      return res.json({ received: true, note: 'Already processed' })
    }

    if (status === 'paid') {
      await Order.updateOrderStatus(Number(orderId), {
        payment_status:   'paid',
        payment_reference: String(gatewayRef ?? reference),
      })

      const downloadToken = await Download.createDownloadToken(Number(orderId))
      console.log(`[WEBHOOK] ✓ Order ${orderId} confirmed. Download token issued: ${downloadToken}`)

      // TODO: Send download token via SMS (Africa's Talking / Beem) and email (SendGrid / Mailgun)
      // await smsService.send(order.phone_number, `Your Kipapi Ramani download link: /api/downloads/${downloadToken}`)
    } else if (status === 'failed') {
      await Order.updateOrderStatus(Number(orderId), {
        payment_status:   'failed',
        payment_reference: String(gatewayRef ?? reference),
      })
      console.log(`[WEBHOOK] ✗ Order ${orderId} marked failed`)
    } else {
      // 'pending_verification' — Pesapal and similar async gateways
      console.log(`[WEBHOOK] Order ${orderId} pending verification — no DB change yet`)
    }

    res.json({ received: true })
  } catch (err) {
    // Always acknowledge receipt even on server error to prevent gateway retries
    console.error('[WEBHOOK] Unhandled error:', err)
    res.json({ received: true, error: 'Internal processing error — logged for review' })
  }
}
