import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/store/`,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('ld_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response interceptor: handle token refresh on 401 and log errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const url = originalRequest?.url ?? ''
    const status = error.response?.status ?? 'Network Error'
    const contentType = error.response?.headers?.['content-type'] ?? ''

    // Handle token refresh on 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('ld_refresh')
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, { refresh: refreshToken })
          const newAccess = res.data.access
          localStorage.setItem('ld_access', newAccess)
          api.defaults.headers.common.Authorization = `Bearer ${newAccess}`
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
          processQueue(null, newAccess)
          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          localStorage.removeItem('ld_access')
          localStorage.removeItem('ld_refresh')
          window.dispatchEvent(new Event('auth_session_expired'))
        } finally {
          isRefreshing = false
        }
      }
    }

    // Warn if backend returned HTML instead of JSON
    if (contentType.includes('text/html')) {
      console.error(
        `[API] Received HTML instead of JSON for ${url} (${status}). ` +
        'Check that the backend endpoint exists and CORS is enabled.'
      )
    } else {
      console.error(`[API] ${status} error on ${url}:`, error.response?.data ?? error.message)
    }

    return Promise.reject(error)
  }
)

export default api