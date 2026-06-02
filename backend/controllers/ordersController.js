import * as Order from '../models/orderModel.js'
import * as Plan from '../models/planModel.js'
import * as Download from '../models/downloadModel.js'

export const createOrder = async (req, res, next) => {
  try {
    const { plan_id, payment_method, phone_number } = req.body
    if (!plan_id || !payment_method || !phone_number) {
      return res.status(400).json({ message: 'plan_id, payment_method, and phone_number are required' })
    }

    const plan = await Plan.getPlanById(plan_id)
    if (!plan) return res.status(404).json({ message: 'Plan not found' })

    const orderId = await Order.createOrder({
      user_id: req.user.id,
      plan_id,
      total_amount: plan.price,
      payment_method,
      phone_number,
    })

    res.status(201).json({
      order_id: orderId,
      amount: plan.price,
      message: 'Order created — awaiting payment',
    })
  } catch (err) {
    next(err)
  }
}

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.getOrdersByUser(req.user.id)
    res.json(orders)
  } catch (err) {
    next(err)
  }
}

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.getAllOrders()
    res.json(orders)
  } catch (err) {
    next(err)
  }
}

// Payment gateway webhook — confirms payment and issues download token
export const paymentWebhook = async (req, res, next) => {
  try {
    const { order_id, payment_reference, status } = req.body

    // TODO: Verify HMAC signature from payment gateway here before trusting payload

    const order = await Order.getOrderById(order_id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    if (status === 'SUCCESS' || status === 'PAID') {
      await Order.updateOrderStatus(order_id, {
        payment_status: 'paid',
        payment_reference,
      })
      const token = await Download.createDownloadToken(order_id)
      // In production: send token via SMS/email to buyer
      console.log(`✓ Payment confirmed for order ${order_id}. Download token: ${token}`)
    } else {
      await Order.updateOrderStatus(order_id, {
        payment_status: 'failed',
        payment_reference,
      })
    }

    res.json({ received: true })
  } catch (err) {
    next(err)
  }
}
