import { api } from './api.js'

// Build a query string from non-empty filter values
const buildQS = (params = {}) => {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) q.set(k, String(v))
  })
  const str = q.toString()
  return str ? `?${str}` : ''
}

// GET /api/plans  (with optional filter params)
export const fetchPlans = (filters = {}) =>
  api.get(`/plans${buildQS(filters)}`)

// GET /api/plans/:id
export const fetchPlan = (id) =>
  api.get(`/plans/${id}`)

// POST /api/plans  — admin only, multipart upload
export const uploadPlan = (formData) =>
  api.upload('/plans', formData)

// PUT /api/plans/:id  — admin only
export const updatePlan = (id, data) =>
  api.put(`/plans/${id}`, data)

// DELETE /api/plans/:id  — admin only (soft delete)
export const deletePlan = (id) =>
  api.del(`/plans/${id}`)
