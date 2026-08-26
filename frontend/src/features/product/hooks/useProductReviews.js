import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../../../services/api'

const PAGE_SIZE = 10

/**
 * Fetch reviews for a product, paginated and filterable by star rating,
 * from GET /api/store/products/<id>/reviews/.
 */
export function useProductReviews(productId, selectedStar) {
  const [reviews, setReviews] = useState([])
  const [filteredTotal, setFilteredTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const offsetRef = useRef(0)
  const requestId = useRef(0)

  const fetchPage = useCallback(async (offset, append) => {
    if (!productId) return
    const thisRequest = ++requestId.current
    append ? setLoadingMore(true) : setLoading(true)
    setError(null)
    try {
      const params = { limit: PAGE_SIZE, offset }
      if (selectedStar && selectedStar !== 'all') params.rating = selectedStar
      const res = await api.get(`products/${productId}/reviews/`, { params })
      if (thisRequest !== requestId.current) return // stale response, ignore
      const data = res.data
      setReviews(prev => append ? [...prev, ...(data.reviews || [])] : (data.reviews || []))
      setFilteredTotal(data.filtered_total ?? data.total ?? 0)
      setHasMore(Boolean(data.has_more))
      offsetRef.current = offset + (data.reviews?.length || 0)
    } catch (e) {
      setError(e.response?.data?.error || 'Không tải được đánh giá')
    } finally {
      append ? setLoadingMore(false) : setLoading(false)
    }
  }, [productId, selectedStar])

  useEffect(() => {
    offsetRef.current = 0
    fetchPage(0, false)
  }, [fetchPage])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    fetchPage(offsetRef.current, true)
  }, [fetchPage, loadingMore, hasMore])

  return { reviews, filteredTotal, hasMore, loading, loadingMore, error, loadMore }
}
