import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { testConnection } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'

import authRoutes     from './routes/auth.js'
import plansRoutes    from './routes/plans.js'
import ordersRoutes   from './routes/orders.js'
import downloadRoutes from './routes/downloads.js'
import paymentRoutes  from './routes/payments.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 8007

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['https://nardio.online', 'https://www.nardio.online'],
  credentials: true
}));


// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Public static — thumbnails ONLY ──────────────────────────────────────────
// secure_storage/ is intentionally NOT served here — access is gated by /api/downloads/:token
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/plans',     plansRoutes)
app.use('/api/orders',    ordersRoutes)
app.use('/api/downloads', downloadRoutes)
app.use('/api/payments',  paymentRoutes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Kipapi Ramani API' }))

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route ${req.path} not found` }))

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  await testConnection()
  console.log(`✓ Kipapi Ramani API running on port ${PORT} [${process.env.NODE_ENV}]`)
})
