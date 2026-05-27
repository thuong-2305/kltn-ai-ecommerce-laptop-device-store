import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'

/**
 * useProductDetail - Custom hook to fetch a single product's full detail
 */
export function useProductDetail(productId) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProduct = useCallback(async () => {
    if (!productId) return
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`products/${productId}/`)
      setProduct(response.data)
    } catch (err) {
      console.error('Error fetching product detail:', err)
      const status = err.response?.status
      if (status === 404) {
        setError('Sản phẩm không tồn tại hoặc đã bị xóa.')
      } else {
        setError(err.response?.data?.error || err.message || 'Không thể tải sản phẩm. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  return { product, loading, error, refetch: fetchProduct }
}
