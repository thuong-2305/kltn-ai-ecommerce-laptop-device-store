import { useState, useEffect, useCallback } from 'react'
import { authApi } from '../../../services/authApi'
import { useAuth } from '../../../contexts/AuthContext'

/**
 * useProfile — fetches and manages profile state + update/change-pw actions
 */
export function useProfile() {
  const { getAccessToken, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      let token = getAccessToken()
      if (!token) throw new Error('Chưa đăng nhập')
      
      try {
        const data = await authApi.getProfile(token)
        setProfile(data.profile)
      } catch (err) {
        // If access token is expired or invalid (401), try to refresh it
        if (err.response?.status === 401) {
          const refresh = localStorage.getItem('ld_refresh')
          if (refresh) {
            try {
              const refreshData = await authApi.refreshToken(refresh)
              const newAccess = refreshData.access
              localStorage.setItem('ld_access', newAccess)
              
              // Retry fetching the profile with the new access token
              const retryData = await authApi.getProfile(newAccess)
              setProfile(retryData.profile)
              return // Exit successfully
            } catch (refreshErr) {
              // Refresh token is also expired or invalid
              localStorage.removeItem('ld_access')
              localStorage.removeItem('ld_refresh')
              throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.')
            }
          }
        }
        throw err
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Không tải được hồ sơ')
      // If unauthorized, trigger logout to redirect to /auth
      if (e.response?.status === 401 || e.message?.includes('đăng nhập lại')) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }, [getAccessToken, logout])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = async (formData) => {
    let token = getAccessToken()
    try {
      const data = await authApi.updateProfile(formData, token)
      setProfile(data.profile)
      return data
    } catch (err) {
      // If expired, try to refresh and retry
      if (err.response?.status === 401) {
        const refresh = localStorage.getItem('ld_refresh')
        if (refresh) {
          const refreshData = await authApi.refreshToken(refresh)
          const newAccess = refreshData.access
          localStorage.setItem('ld_access', newAccess)
          const data = await authApi.updateProfile(formData, newAccess)
          setProfile(data.profile)
          return data
        }
      }
      throw err
    }
  }

  const changePassword = async (formData) => {
    let token = getAccessToken()
    try {
      const data = await authApi.changePassword(formData, token)
      if (data.access) {
        localStorage.setItem('ld_access', data.access)
        localStorage.setItem('ld_refresh', data.refresh)
      }
      return data
    } catch (err) {
      // If expired, try to refresh and retry
      if (err.response?.status === 401) {
        const refresh = localStorage.getItem('ld_refresh')
        if (refresh) {
          const refreshData = await authApi.refreshToken(refresh)
          const newAccess = refreshData.access
          localStorage.setItem('ld_access', newAccess)
          const data = await authApi.changePassword(formData, newAccess)
          if (data.access) {
            localStorage.setItem('ld_access', data.access)
            localStorage.setItem('ld_refresh', data.refresh)
          }
          return data
        }
      }
      throw err
    }
  }

  return { profile, loading, error, fetchProfile, updateProfile, changePassword }
}
