import pool from '../config/db.js'

export const createOrder = async ({ user_id, plan_id, total_amount, payment_method, phone_number }) => {
  const [result] = await pool.query(
    `INSERT INTO orders (user_id, plan_id, total_amount, payment_method, phone_number)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, plan_id, total_amount, payment_method, phone_number]
  )
  return result.insertId
}

export const getOrderById = async (id) => {
  const [rows] = await pool.query(
    `SELECT o.*, p.title AS plan_title, u.name AS user_name, u.email
     FROM orders o
     JOIN house_plans p ON o.plan_id = p.id
     JOIN users u ON o.user_id = u.id
     WHERE o.id = ?`,
    [id]
  )
  return rows[0] || null
}

export const getOrderByReference = async (reference) => {
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE payment_reference = ?',
    [reference]
  )
  return rows[0] || null
}

export const getOrdersByUser = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT o.id, o.total_amount, o.payment_status, o.payment_method,
            o.created_at, p.title AS plan_title, p.thumbnail_url
     FROM orders o
     JOIN house_plans p ON o.plan_id = p.id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC`,
    [user_id]
  )
  return rows
}

export const updateOrderStatus = async (id, { payment_status, payment_reference }) => {
  const [result] = await pool.query(
    'UPDATE orders SET payment_status = ?, payment_reference = ? WHERE id = ?',
    [payment_status, payment_reference, id]
  )
  return result.affectedRows
}

export const getAllOrders = async () => {
  const [rows] = await pool.query(
    `SELECT o.id, o.total_amount, o.payment_status, o.payment_method,
            o.created_at, p.title AS plan_title, u.name AS user_name, u.email
     FROM orders o
     JOIN house_plans p ON o.plan_id = p.id
     JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC`
  )
  return rows
}
