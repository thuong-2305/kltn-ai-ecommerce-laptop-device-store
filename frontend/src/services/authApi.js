import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const BASE = `${API_BASE_URL}/api/auth`

const api = axios.create({ baseURL: BASE, withCredentials: true })

export const authApi = {
  register: (data) => api.post('/register/', data).then(r => r.data),
  login: (data) => api.post('/login/', data).then(r => r.data),
  logout: (refresh) => api.post('/logout/', { refresh }).then(r => r.data),
  refreshToken: (refresh) => api.post('/token/refresh/', { refresh }).then(r => r.data),
  me: (accessToken) =>
    api.get('/me/', { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.data),
  googleOAuth: (id_token) => api.post('/google/', { id_token }).then(r => r.data),
  sendOTP: (email) => api.post('/otp/send/', { email }).then(r => r.data),

  // ── Profile ─────────────────────────────────────────────────
  getProfile: (token) =>
    api.get('/profile/', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  updateProfile: (data, token) =>
    api.patch('/profile/', data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  changePassword: (data, token) =>
    api.post('/change-password/', data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
}
