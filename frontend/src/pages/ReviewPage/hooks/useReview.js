import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'

export function useReview(productId) {
  const [product, setProduct] = useState(null)
  const [existingReview, setExistingReview] = useState(null)
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ avg_rating: 0, total: 0, breakdown: {} })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    setError('')
    const token = localStorage.getItem('ld_access')
    try {
      const [productRes, reviewsRes, myReviewRes] = await Promise.all([
        api.get(`products/${productId}/`),
        api.get(`products/${productId}/reviews/`),
        token 
          ? api.get(`products/${productId}/my-review/`) 
          : Promise.resolve({ data: { review: null } }),
      ])
      setProduct(productRes.data)
      setReviews(reviewsRes.data.reviews || [])
      setStats({
        avg_rating: reviewsRes.data.avg_rating || 0,
        total: reviewsRes.data.total || 0,
        breakdown: reviewsRes.data.breakdown || {},
      })
      setExistingReview(myReviewRes.data.review || null)
    } catch (e) {
      setError(e.response?.data?.error || 'Không tải được dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { 
    fetchAll() 
  }, [fetchAll])

  const submitReview = async (formData) => {
    setSubmitting(true)
    try {
      const res = await api.post('reviews/', formData)
      await fetchAll()
      return { success: true, message: res.data.message }
    } catch (e) {
      return { success: false, message: e.response?.data?.error || 'Gửi đánh giá thất bại' }
    } finally {
      setSubmitting(false)
    }
  }

  return { product, reviews, stats, existingReview, loading, submitting, error, submitReview }
}
