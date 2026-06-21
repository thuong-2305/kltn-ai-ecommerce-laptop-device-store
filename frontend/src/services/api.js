import apiClient from './apiClient'

const api = {
  get: (url, config) => apiClient.get(`store/${url.replace(/^\//, '')}`, config),
  post: (url, data, config) => apiClient.post(`store/${url.replace(/^\//, '')}`, data, config),
  put: (url, data, config) => apiClient.put(`store/${url.replace(/^\//, '')}`, data, config),
  patch: (url, data, config) => apiClient.patch(`store/${url.replace(/^\//, '')}`, data, config),
  delete: (url, config) => apiClient.delete(`store/${url.replace(/^\//, '')}`, config),
}

export default api