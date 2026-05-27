import { useState, useCallback, useEffect } from 'react'
import * as cartService from '../../../services/cartApi'

/**
 * useCart — manages all cart state and actions
 * Syncs with Django session-based cart backend
 */
export function useCart() {
  const [cart, setCart] = useState({
    items: [],
    item_count: 0,
    total_qty: 0,
    subtotal: 0,
    shipping_method: 'normal',
    shipping_cost: 20000,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const handleResponse = (data) => {
    setCart({
      items: data.items ?? [],
      item_count: data.item_count ?? 0,
      total_qty: data.total_qty ?? 0,
      subtotal: data.subtotal ?? 0,
      shipping_method: data.shipping_method ?? 'normal',
      shipping_cost: data.shipping_cost ?? 20000,
      total: data.total ?? 0,
    })
  }

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await cartService.getCart()
      handleResponse(res.data)
    } catch (err) {
      console.error('Cart fetch error:', err)
      setError('Không thể tải giỏ hàng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addItem = useCallback(async (productId, quantity = 1) => {
    setActionLoading(true)
    try {
      const res = await cartService.addToCart(productId, quantity)
      handleResponse(res.data)
      return { success: true, message: res.data.message }
    } catch (err) {
      const msg = err.response?.data?.error || 'Không thể thêm sản phẩm'
      return { success: false, message: msg }
    } finally {
      setActionLoading(false)
    }
  }, [])

  const updateItem = useCallback(async (productId, quantity) => {
    setActionLoading(true)
    try {
      const res = await cartService.updateCartItem(productId, quantity)
      handleResponse(res.data)
    } catch (err) {
      console.error('Update cart error:', err)
    } finally {
      setActionLoading(false)
    }
  }, [])

  const removeItem = useCallback(async (productId) => {
    setActionLoading(true)
    try {
      const res = await cartService.deleteCartItem(productId)
      handleResponse(res.data)
    } catch (err) {
      console.error('Delete cart error:', err)
    } finally {
      setActionLoading(false)
    }
  }, [])

  const changeShipping = useCallback(async (method) => {
    setActionLoading(true)
    try {
      const res = await cartService.updateShipping(method)
      handleResponse(res.data)
    } catch (err) {
      console.error('Shipping update error:', err)
    } finally {
      setActionLoading(false)
    }
  }, [])

  return {
    cart,
    loading,
    error,
    actionLoading,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    changeShipping,
  }
}
