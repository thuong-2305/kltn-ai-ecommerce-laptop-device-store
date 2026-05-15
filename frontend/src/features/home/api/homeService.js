import api from '../../../services/api'

export async function fetchHomeData() {
  const response = await api.get('store/home/')
  return response.data
}