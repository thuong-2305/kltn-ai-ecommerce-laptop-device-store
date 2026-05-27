import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const wishlistApi = axios.create({
  baseURL: `${API_BASE_URL}/api/wishlist/`,
  withCredentials: true, // needed to maintain Django session cookies
})

export const getWishlist = () => wishlistApi.get('')

export const addToWishlist = (productId) =>
  wishlistApi.post('add/', { product_id: productId })

export const removeFromWishlist = (productId) =>
  wishlistApi.post('remove/', { product_id: productId })

export const wishlistToCart = (productId) =>
  wishlistApi.post('addToCart/', { product_id: productId })
