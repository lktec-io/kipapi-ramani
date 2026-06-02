import pool from '../config/db.js'
import bcrypt from 'bcryptjs'

export const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
  return rows[0] || null
}

export const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
    [id]
  )
  return rows[0] || null
}

export const createUser = async ({ name, email, password, role = 'client' }) => {
  const hash = await bcrypt.hash(password, 12)
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, role]
  )
  return result.insertId
}

export const verifyPassword = async (plain, hash) => bcrypt.compare(plain, hash)
