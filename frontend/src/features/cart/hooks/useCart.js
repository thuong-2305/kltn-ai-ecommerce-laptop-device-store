import { create } from 'zustand'
import { useEffect } from 'react'
import * as cartService from '../../../services/cartApi'

/**
 * useCartStore — global Zustand store to manage cart state across components.
 */
export const useCartStore = create((set, get) => ({
  cart: {
    items: [],
    item_count: 0,
    total_qty: 0,
    subtotal: 0,
    shipping_method: 'normal',
    shipping_cost: 20000,
    total: 0,
  },
  loading: false,
  error: null,
  actionLoading: false,
  hasFetched: false,

  fetchCart: async () => {
    set({ loading: true, error: null })
    try {
      const res = await cartService.getCart()
      const data = res.data
      set({
        cart: {
          items: data.items ?? [],
          item_count: data.item_count ?? 0,
          total_qty: data.total_qty ?? 0,
          subtotal: data.subtotal ?? 0,
          shipping_method: data.shipping_method ?? 'normal',
          shipping_cost: data.shipping_cost ?? 20000,
          total: data.total ?? 0,
        },
        hasFetched: true,
      })
    } catch (err) {
      console.error('Cart fetch error:', err)
      set({ error: 'Không thể tải giỏ hàng. Vui lòng thử lại.' })
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (productId, quantity = 1, variantId = null) => {
    set({ actionLoading: true })
    try {
      const res = await cartService.addToCart(productId, quantity, variantId)
      const data = res.data
      set({
        cart: {
          items: data.items ?? [],
          item_count: data.item_count ?? 0,
          total_qty: data.total_qty ?? 0,
          subtotal: data.subtotal ?? 0,
          shipping_method: data.shipping_method ?? 'normal',
          shipping_cost: data.shipping_cost ?? 20000,
          total: data.total ?? 0,
        },
      })
      return { success: true, message: data.message }
    } catch (err) {
      const msg = err.response?.data?.error || 'Không thể thêm sản phẩm'
      return { success: false, message: msg }
    } finally {
      set({ actionLoading: false })
    }
  },

  updateItem: async (productId, quantity, variantId = null) => {
    set({ actionLoading: true })
    try {
      const res = await cartService.updateCartItem(productId, quantity, variantId)
      const data = res.data
      set({
        cart: {
          items: data.items ?? [],
          item_count: data.item_count ?? 0,
          total_qty: data.total_qty ?? 0,
          subtotal: data.subtotal ?? 0,
          shipping_method: data.shipping_method ?? 'normal',
          shipping_cost: data.shipping_cost ?? 20000,
          total: data.total ?? 0,
        },
      })
    } catch (err) {
      console.error('Update cart error:', err)
    } finally {
      set({ actionLoading: false })
    }
  },

  removeItem: async (productId, variantId = null) => {
    set({ actionLoading: true })
    try {
      const res = await cartService.deleteCartItem(productId, variantId)
      const data = res.data
      set({
        cart: {
          items: data.items ?? [],
          item_count: data.item_count ?? 0,
          total_qty: data.total_qty ?? 0,
          subtotal: data.subtotal ?? 0,
          shipping_method: data.shipping_method ?? 'normal',
          shipping_cost: data.shipping_cost ?? 20000,
          total: data.total ?? 0,
        },
      })
    } catch (err) {
      console.error('Delete cart error:', err)
    } finally {
      set({ actionLoading: false })
    }
  },

  changeShipping: async (method) => {
    set({ actionLoading: true })
    try {
      const res = await cartService.updateShipping(method)
      const data = res.data
      set({
        cart: {
          items: data.items ?? [],
          item_count: data.item_count ?? 0,
          total_qty: data.total_qty ?? 0,
          subtotal: data.subtotal ?? 0,
          shipping_method: data.shipping_method ?? 'normal',
          shipping_cost: data.shipping_cost ?? 20000,
          total: data.total ?? 0,
        },
      })
    } catch (err) {
      console.error('Shipping update error:', err)
    } finally {
      set({ actionLoading: false })
    }
  },

  mergeGuestCart: async (guestCart = {}) => {
    set({ actionLoading: true })
    try {
      const res = await cartService.mergeCart(guestCart)
      const data = res.data
      set({
        cart: {
          items: data.items ?? [],
          item_count: data.item_count ?? 0,
          total_qty: data.total_qty ?? 0,
          subtotal: data.subtotal ?? 0,
          shipping_method: data.shipping_method ?? 'normal',
          shipping_cost: data.shipping_cost ?? 20000,
          total: data.total ?? 0,
        },
      })
      return { success: true, message: data.message }
    } catch (err) {
      console.error('Merge cart error:', err)
      return { success: false }
    } finally {
      set({ actionLoading: false })
    }
  },
}))

/**
 * useCart Hook - backwards-compatible wrapper around useCartStore.
 */
export function useCart() {
  const store = useCartStore()

  useEffect(() => {
    if (!store.hasFetched && !store.loading) {
      store.fetchCart()
    }
  }, [store.hasFetched, store.loading, store.fetchCart])

  return store
}
