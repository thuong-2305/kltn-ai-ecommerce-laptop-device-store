import { useState, useCallback, useEffect } from 'react'

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

      const queryParams = new URLSearchParams()
      if (filters.category) queryParams.append('category', filters.category)
      if (filters.search) queryParams.append('search', filters.search)
      queryParams.append('min_price', filters.minPrice)
      queryParams.append('max_price', filters.maxPrice)
      queryParams.append('sort', filters.sortBy)
      queryParams.append('page', pagination.page)
      queryParams.append('limit', pagination.limit)

      // Dummy API call - replace dengan actual endpoint
      const response = await fetch(`/api/products?${queryParams}`)
      
      if (!response.ok) throw new Error('Failed to fetch products')
      
      const data = await response.json()
      
      setProducts(data.results || [])
      setPagination((prev) => ({
        ...prev,
        total: data.count || 0,
        totalPages: Math.ceil((data.count || 0) / prev.limit),
      }))
    } catch (err) {
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  /**
   * Fetch products ketika filter atau page berubah
   */
  useEffect(() => {
    fetchProducts()
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
