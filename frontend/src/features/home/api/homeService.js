import api from '../../../services/api'

export async function fetchHomeData() {
  const response = await api.get('home/')
  return response.data
}