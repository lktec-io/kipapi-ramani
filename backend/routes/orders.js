import { Router } from 'express'
import {
  createOrder, getMyOrders, getAllOrders, paymentWebhook,
} from '../controllers/ordersController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = Router()

// Webhook is public — payment gateway calls this with no user session
// (signature verification happens inside the controller)
router.post('/webhook', paymentWebhook)

router.post('/', protect, createOrder)
router.get('/my', protect, getMyOrders)
router.get('/', protect, adminOnly, getAllOrders)

export default router
