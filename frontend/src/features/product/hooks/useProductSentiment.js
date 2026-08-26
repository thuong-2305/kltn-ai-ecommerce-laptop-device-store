import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'

/**
 * useProductSentiment — Fetch tổng hợp cảm xúc công khai của sản phẩm.
 * Gọi endpoint: GET /api/store/products/<productId>/public-sentiment/
 * Không yêu cầu xác thực.
 */
export function useProductSentiment(productId) {
  const [sentiment, setSentiment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSentiment = useCallback(async () => {
    if (!productId) return
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`products/${productId}/public-sentiment/`)
      setSentiment(response.data)
    } catch (err) {
      console.error('Error fetching product sentiment:', err)
      setError(err.response?.data?.error || err.message || 'Không thể tải dữ liệu cảm xúc.')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchSentiment()
  }, [fetchSentiment])

  return { sentiment, loading, error, refetch: fetchSentiment }
}
