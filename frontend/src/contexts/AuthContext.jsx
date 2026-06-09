/**
 * AuthContext — Global auth state management
 * Stores JWT in localStorage, provides: user, login, logout, register
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { authApi } from '../services/authApi'
import { mergeCart } from '../services/cartApi'

const AuthContext = createContext(null)

const TOKEN_KEY = 'ld_access'
const REFRESH_KEY = 'ld_refresh'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true while restoring session

  // ── Restore session on mount ──────────────────────────────────
  useEffect(() => {
    const access = localStorage.getItem(TOKEN_KEY)
    const refresh = localStorage.getItem(REFRESH_KEY)
    if (!access && !refresh) { setLoading(false); return }

    authApi.me(access)
      .then(({ user }) => setUser(user))
      .catch(async () => {
        // Try to refresh
        if (refresh) {
          try {
            const { access: newAccess } = await authApi.refreshToken(refresh)
            localStorage.setItem(TOKEN_KEY, newAccess)
            const { user } = await authApi.me(newAccess)
            setUser(user)
          } catch {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(REFRESH_KEY)
          }
        }
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Handle Session Expiration ────────────────────────────────
  useEffect(() => {
    const handleExpired = () => {
      setUser(null)
    }
    window.addEventListener('auth_session_expired', handleExpired)
    return () => window.removeEventListener('auth_session_expired', handleExpired)
  }, [])

  // ── Register ──────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const data = await authApi.register(formData)
    localStorage.setItem(TOKEN_KEY, data.access)
    localStorage.setItem(REFRESH_KEY, data.refresh)
    setUser(data.user)
    try {
      await mergeCart()
    } catch (err) {
      console.error('Failed to merge cart on registration:', err)
    }
    return data.user
  }, [])

  // ── Login ─────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials)
    localStorage.setItem(TOKEN_KEY, data.access)
    localStorage.setItem(REFRESH_KEY, data.refresh)
    setUser(data.user)
    try {
      await mergeCart()
    } catch (err) {
      console.error('Failed to merge cart on login:', err)
    }
    return data.user
  }, [])

  // ── Google OAuth ──────────────────────────────────────────────
  const loginWithGoogle = useCallback(async (idToken) => {
    const data = await authApi.googleOAuth(idToken)
    localStorage.setItem(TOKEN_KEY, data.access)
    localStorage.setItem(REFRESH_KEY, data.refresh)
    setUser(data.user)
    try {
      await mergeCart()
    } catch (err) {
      console.error('Failed to merge cart on Google login:', err)
    }
    return data.user
  }, [])

  // ── Send OTP ──────────────────────────────────────────────────
  const sendOTP = useCallback(async (email) => {
    return await authApi.sendOTP(email)
  }, [])

  // ── Logout ────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refresh = localStorage.getItem(REFRESH_KEY)
    try { if (refresh) await authApi.logout(refresh) } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setUser(null)
  }, [])

  // ── Helpers ───────────────────────────────────────────────────
  const getAccessToken = useCallback(() => localStorage.getItem(TOKEN_KEY), [])

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
    getAccessToken,
    sendOTP,
  }), [user, loading, login, register, logout, loginWithGoogle, getAccessToken, sendOTP])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
