import apiClient from './apiClient'

export const getWishlist = () => apiClient.get('wishlist/')

export const addToWishlist = (productId) =>
  apiClient.post('wishlist/add/', { product_id: productId })

export const removeFromWishlist = (productId) =>
  apiClient.post('wishlist/remove/', { product_id: productId })

export const wishlistToCart = (productId) =>
  apiClient.post('wishlist/addToCart/', { product_id: productId })

