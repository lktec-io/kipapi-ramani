import pool from '../config/db.js'

// Safe column whitelist for updatePlan — prevents SQL injection via field names
const UPDATABLE_FIELDS = new Set([
  'title', 'description', 'price', 'bedrooms', 'bathrooms',
  'stories', 'plot_size', 'style', 'thumbnail_url', 'is_active',
])

export const getAllPlans = async (filters = {}) => {
  let sql = `
    SELECT id, title, description, price, bedrooms, bathrooms, stories,
           plot_size, style, thumbnail_url, created_at
    FROM house_plans
    WHERE is_active = 1`
  const params = []

  if (filters.search) {
    sql += ' AND (title LIKE ? OR description LIKE ? OR style LIKE ?)'
    const term = `%${filters.search}%`
    params.push(term, term, term)
  }

  if (filters.bedrooms) {
    const b = Number(filters.bedrooms)
    sql += b >= 5 ? ' AND bedrooms >= 5' : ' AND bedrooms = ?'
    if (b < 5) params.push(b)
  }

  if (filters.stories) {
    const s = Number(filters.stories)
    // "Multi-storey" means 2+ floors
    sql += s >= 2 ? ' AND stories >= 2' : ' AND stories = ?'
    if (s < 2) params.push(s)
  }

  if (filters.style)    { sql += ' AND style = ?';    params.push(filters.style)    }
  if (filters.minPrice) { sql += ' AND price >= ?';   params.push(Number(filters.minPrice)) }
  if (filters.maxPrice) { sql += ' AND price <= ?';   params.push(Number(filters.maxPrice)) }

  sql += ' ORDER BY created_at DESC'

  const [rows] = await pool.query(sql, params)
  return rows
}

export const getPlanById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, title, description, price, bedrooms, bathrooms, stories,
            plot_size, style, thumbnail_url, created_at
     FROM house_plans WHERE id = ? AND is_active = 1`,
    [id]
  )
  return rows[0] || null
}

// Internal — includes secure_file_path (never exposed in public API responses)
export const getPlanSecurePath = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, title, secure_file_path FROM house_plans WHERE id = ?',
    [id]
  )
  return rows[0] || null
}

export const createPlan = async (data) => {
  const { title, description, price, bedrooms, bathrooms, stories,
          plot_size, style, thumbnail_url, secure_file_path } = data
  const [result] = await pool.query(
    `INSERT INTO house_plans
       (title, description, price, bedrooms, bathrooms, stories, plot_size, style, thumbnail_url, secure_file_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, price, bedrooms, bathrooms, stories, plot_size, style, thumbnail_url, secure_file_path]
  )
  return result.insertId
}

export const updatePlan = async (id, data) => {
  // Only allow known safe columns
  const safe = Object.fromEntries(
    Object.entries(data).filter(([k]) => UPDATABLE_FIELDS.has(k))
  )
  if (!Object.keys(safe).length) return 0

  const fields = Object.keys(safe).map(k => `${k} = ?`).join(', ')
  const [result] = await pool.query(
    `UPDATE house_plans SET ${fields} WHERE id = ?`,
    [...Object.values(safe), id]
  )
  return result.affectedRows
}

export const softDeletePlan = async (id) => {
  const [result] = await pool.query(
    'UPDATE house_plans SET is_active = 0 WHERE id = ?',
    [id]
  )
  return result.affectedRows
}
