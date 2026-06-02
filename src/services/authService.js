const API = import.meta.env.VITE_API_URL || 'https://nardio.online/api'


const handle = async (res) => {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)
  return data
}

export const loginUser = (email, password) =>
  fetch(`${API}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  }).then(handle)

export const registerUser = (name, email, password) =>
  fetch(`${API}/auth/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ name, email, password }),
  }).then(handle)

export const fetchMe = (token) =>
  fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(handle)
