import pool from '../config/db.js'
import crypto from 'crypto'

export const createDownloadToken = async (order_id) => {
  const hours = parseInt(process.env.DOWNLOAD_TOKEN_EXPIRES_HOURS) || 48
  const max   = parseInt(process.env.DOWNLOAD_MAX_COUNT) || 3
  const token = crypto.randomBytes(32).toString('hex')

  await pool.query(
    `INSERT INTO downloads (order_id, unique_token, expires_at, max_downloads)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR), ?)`,
    [order_id, token, hours, max]
  )
  return token
}

export const findValidToken = async (token) => {
  const [rows] = await pool.query(
    `SELECT d.*, o.plan_id, o.user_id, o.payment_status
     FROM downloads d
     JOIN orders o ON d.order_id = o.id
     WHERE d.unique_token = ?
       AND d.expires_at > NOW()
       AND d.download_count < d.max_downloads
       AND o.payment_status = 'paid'`,
    [token]
  )
  return rows[0] || null
}

export const incrementDownloadCount = async (token) => {
  await pool.query(
    'UPDATE downloads SET download_count = download_count + 1 WHERE unique_token = ?',
    [token]
  )
}
