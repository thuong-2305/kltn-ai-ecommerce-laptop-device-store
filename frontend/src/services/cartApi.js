import axios from 'axios'
import { API_BASE_URL } from '../config/api'

// Cart API uses a separate axios instance pointing at /api/cart/
// (Django session-based — no auth token needed for cart ops)
const cartApi = axios.create({
  baseURL: `${API_BASE_URL}/api/cart/`,
  withCredentials: true, // needed to maintain Django session across requests
})

export const getCart = () => cartApi.get('')
export const addToCart = (productId, quantity = 1) =>
  cartApi.post('add/', { product_id: productId, quantity })
export const updateCartItem = (productId, quantity) =>
  cartApi.post('update/', { product_id: productId, quantity })
export const deleteCartItem = (productId) =>
  cartApi.post('delete/', { product_id: productId })
export const updateShipping = (method) =>
  cartApi.post('shipping/', { shipping_method: method })
