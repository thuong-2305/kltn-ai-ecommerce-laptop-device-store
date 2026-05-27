import { create } from 'zustand'
import * as wishlistService from '../services/wishlistApi'

export const useWishlistStore = create((set, get) => ({
  wishlist: [],
  loading: false,
  error: null,

  fetchWishlist: async () => {
    set({ loading: true, error: null })
    try {
      const res = await wishlistService.getWishlist()
      set({ wishlist: res.data.results || [], error: null })
    } catch (err) {
      console.error('Error fetching wishlist:', err)
      set({ error: 'Không thể tải danh sách yêu thích' })
    } finally {
      set({ loading: false })
    }
  },

  toggleWishlist: async (product) => {
    const { wishlist } = get()
    const isExist = wishlist.some(item => item.id === product.id)
    try {
      if (isExist) {
        const res = await wishlistService.removeFromWishlist(product.id)
        set({ wishlist: res.data.results || [] })
        return { success: true, action: 'remove', message: res.data.message }
      } else {
        const res = await wishlistService.addToWishlist(product.id)
        set({ wishlist: res.data.results || [] })
        return { success: true, action: 'add', message: res.data.message }
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err)
      return { success: false, message: 'Thao tác danh sách yêu thích thất bại' }
    }
  },

  removeItem: async (productId) => {
    try {
      const res = await wishlistService.removeFromWishlist(productId)
      set({ wishlist: res.data.results || [] })
      return { success: true, message: res.data.message }
    } catch (err) {
      console.error('Error removing from wishlist:', err)
      return { success: false, message: 'Xóa sản phẩm thất bại' }
    }
  },

  moveToCart: async (productId) => {
    try {
      const res = await wishlistService.wishlistToCart(productId)
      return { success: true, message: res.data.message }
    } catch (err) {
      console.error('Error moving to cart:', err)
      return { success: false, message: 'Thêm vào giỏ hàng thất bại' }
    }
  },

  clearWishlist: async () => {
    const { wishlist } = get()
    try {
      for (const item of wishlist) {
        await wishlistService.removeFromWishlist(item.id)
      }
      set({ wishlist: [] })
      return { success: true, message: 'Đã xóa tất cả sản phẩm khỏi danh sách yêu thích' }
    } catch (err) {
      console.error('Error clearing wishlist:', err)
      return { success: false, message: 'Xóa danh sách thất bại' }
    }
  }
}))
