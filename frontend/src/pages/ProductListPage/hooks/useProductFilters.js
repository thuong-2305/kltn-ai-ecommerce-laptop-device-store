import { useState, useCallback, useEffect } from 'react'
import api from '../../../services/api'

/**
 * useProductFilters - Custom hook untuk manage product filters dan pagination
 * States: filters, sorting, pagination, loading, error
 */
export function useProductFilters() {
  // Filter states
  const [filters, setFilters] = useState({
    category: null,
    search: '',
    minPrice: 0,
    maxPrice: 100000000,
    sortBy: 'newest', // newest, price-asc, price-desc, rating
  })

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  // Data states
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Fetch products dari API dengan filters & pagination
   */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {}
      if (filters.category) params.category = filters.category
      if (filters.search) params.search = filters.search
      params.min_price = filters.minPrice
      params.max_price = filters.maxPrice
      params.sort = filters.sortBy
      params.page = pagination.page
      params.limit = pagination.limit

      // Gunakan axios instance dari services/api.js
      const response = await api.get('/products', { params })
      const data = response.data
      
      setProducts(data.results || [])
      setPagination((prev) => ({
        ...prev,
        total: data.count || 0,
        totalPages: Math.ceil((data.count || 0) / prev.limit),
      }))
    } catch (err) {
      console.error('Error fetching products:', err)
      // Tangani pesan error secara gracefully
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu sản phẩm. Vui lòng thử lại sau.'
      setError(errorMessage)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  /**
   * Fetch products ketika filter atau page berubah (dengan debounce)
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts()
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [fetchProducts])

  /**
   * Update filter dan reset ke page 1
   */
  const updateFilter = useCallback((filterKey, value) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }))
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to page 1
  }, [])

  /**
   * Update multiple filters sekaligus
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  /**
   * Change current page
   */
  const goToPage = useCallback((page) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages)),
    }))
  }, [])

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setFilters({
      category: null,
      search: '',
      minPrice: 0,
      maxPrice: 100000000,
      sortBy: 'newest',
    })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  return {
    // States
    products,
    filters,
    pagination,
    loading,
    error,

    // Actions
    updateFilter,
    updateFilters,
    goToPage,
    resetFilters,
    refetch: fetchProducts,
  }
}
