const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const request = async (endpoint, { body, method = 'GET', headers = {}, isFormData = false } = {}) => {
  const token = localStorage.getItem('kr_token')

  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      // Do not set Content-Type for FormData — browser sets it with the boundary
      ...(!isFormData && body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  })

  // Parse JSON; fall back to empty object for non-JSON responses (e.g. 204 No Content)
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.message || `API error ${res.status}`)
    err.status = res.status
    throw err
  }

  return data
}

export const api = {
  get:        (path)              => request(path),
  post:       (path, body)        => request(path, { method: 'POST', body }),
  put:        (path, body)        => request(path, { method: 'PUT',  body }),
  patch:      (path, body)        => request(path, { method: 'PATCH', body }),
  del:        (path)              => request(path, { method: 'DELETE' }),
  // Multipart upload (file inputs) — pass a FormData instance as body
  upload:     (path, formData)    => request(path, { method: 'POST', body: formData, isFormData: true }),
}
