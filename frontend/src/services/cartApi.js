import apiClient from './apiClient'

export const getCart = () => apiClient.get('cart/')

export const addToCart = (productId, quantity = 1, variantId = null) =>
  apiClient.post('cart/add/', { product_id: productId, quantity, variant_id: variantId })

export const updateCartItem = (productId, quantity, variantId = null) =>
  apiClient.post('cart/update/', { product_id: productId, quantity, variant_id: variantId })

export const deleteCartItem = (productId, variantId = null) =>
  apiClient.post('cart/delete/', { product_id: productId, variant_id: variantId })

export const updateShipping = (method) =>
  apiClient.post('cart/shipping/', { shipping_method: method })

export const mergeCart = (guestCart) =>
  apiClient.post('cart/merge/', { cart: guestCart })
