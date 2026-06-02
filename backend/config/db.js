import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+03:00', // East Africa Time
})

export const testConnection = async () => {
  const conn = await pool.getConnection()
  console.log(`✓ MySQL connected — database: ${process.env.DB_NAME}`)
  conn.release()
}

export default pool
