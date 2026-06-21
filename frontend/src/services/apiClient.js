import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const TOKEN_KEY = 'ld_access'
const REFRESH_KEY = 'ld_refresh'

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  withCredentials: true,
})

// Request Interceptor: Attach access token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
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

// Response Interceptor: Handle automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const url = originalRequest?.url ?? ''
    const status = error.response?.status ?? 'Network Error'

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem(REFRESH_KEY)
      if (refreshToken) {
        try {
          // Use raw axios to prevent infinite recursion
          const res = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, { refresh: refreshToken })
          const newAccess = res.data.access
          localStorage.setItem(TOKEN_KEY, newAccess)
          
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccess}`
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
          
          processQueue(null, newAccess)
          return apiClient(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(REFRESH_KEY)
          window.dispatchEvent(new Event('auth_session_expired'))
        } finally {
          isRefreshing = false
        }
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
