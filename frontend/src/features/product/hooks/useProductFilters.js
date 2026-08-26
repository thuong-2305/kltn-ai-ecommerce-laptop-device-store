import { useState, useCallback, useEffect } from 'react'
import api from '../../../services/api'

/** Manages product filter/sort state, pagination, and the fetch that keeps them in sync. */
export function useProductFilters() {
  const [filters, setFilters] = useState({
    category: null,
    brand: null,
    search: '',
    ids: null,
    minPrice: 0,
    maxPrice: 100000000,
    cpu: null,
    ram: null,
    storage: null,
    screen: null,
    os: null,
    availability: null,
    sortBy: 'newest', // newest, price-asc, price-desc, rating, popular
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {}
      if (filters.category) params.category = filters.category
      if (filters.brand) params.brand = filters.brand
      if (filters.search) params.search = filters.search
      if (filters.ids) params.ids = filters.ids
      if (filters.cpu) params.cpu = filters.cpu
      if (filters.ram) params.ram = filters.ram
      if (filters.storage) params.storage = filters.storage
      if (filters.screen) params.screen = filters.screen
      if (filters.os) params.os = filters.os
      params.min_price = filters.minPrice
      params.max_price = filters.maxPrice
      params.sort = filters.sortBy
      params.page = pagination.page
      params.limit = pagination.limit

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
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu sản phẩm. Vui lòng thử lại sau.'
      setError(errorMessage)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  // Debounce so rapid filter changes don't trigger a request per keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts()
    }, 300)

    return () => clearTimeout(timer)
  }, [fetchProducts])

  const updateFilter = useCallback((filterKey, value) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const goToPage = useCallback((page) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages)),
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      category: null,
      brand: null,
      search: '',
      ids: null,
      minPrice: 0,
      maxPrice: 100000000,
      cpu: null,
      ram: null,
      storage: null,
      screen: null,
      os: null,
      availability: null,
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
