import { create } from 'zustand'
import { fetchHomeData } from '../api/homeService'

const initialState = {
  homeData: null,
  loading: false,
  error: '',
  activeHeroIndex: 0,
  activeTabId: 'all',
}

export const useHomeStore = create((set, get) => ({
  ...initialState,
  loadHomeData: async () => {
    if (get().loading) {
      return
    }

    set({ loading: true, error: '' })

    try {
      const homeData = await fetchHomeData()
      set({ homeData, error: '' })
    } catch {
      set({ error: 'Không tải được dữ liệu trang chủ. Hãy kiểm tra backend API.' })
    } finally {
      set({ loading: false })
    }
  },
  setActiveHeroIndex: (activeHeroIndex) => set({ activeHeroIndex }),
  nextHero: (totalSlides) => {
    if (!totalSlides) {
      return
    }

    const currentIndex = get().activeHeroIndex
    set({ activeHeroIndex: (currentIndex + 1) % totalSlides })
  },
  prevHero: (totalSlides) => {
    if (!totalSlides) {
      return
    }

    const currentIndex = get().activeHeroIndex
    set({ activeHeroIndex: (currentIndex - 1 + totalSlides) % totalSlides })
  },
  setActiveTabId: (activeTabId) => set({ activeTabId }),
  resetHomeState: () => set(initialState),
}))