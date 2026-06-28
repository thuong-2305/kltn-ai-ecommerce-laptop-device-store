import { useEffect, useMemo } from 'react'
import { useHomeStore } from '../../features/home/store/useHomeStore'
import { buildHomeViewModel } from '../../features/home/utils/homeViewModel'
import HomeLoadingState from '../../features/home/components/HomeLoadingState'
import HomeErrorState from '../../features/home/components/HomeErrorState'
import HomeHeroSection from '../../features/home/components/HomeHeroSection'
import HomeFlashSaleSection from '../../features/home/components/HomeFlashSaleSection'
import HomeFeaturedProducts from '../../features/home/components/HomeFeaturedProducts'
import HomeSupportBanners from '../../features/home/components/HomeSupportBanners'
import HomeBrandStrip from '../../features/home/components/HomeBrandStrip'
import HomeNewsSection from '../../features/home/components/HomeNewsSection'
import HomeInfoBar from '../../features/home/components/HomeInfoBar'
import HomeTopProducts from '../../features/home/components/HomeTopProducts'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

function HomePage() {
  useDocumentTitle('Trang chủ', 'LAPTOP DEVICE STORE - Cửa hàng laptop uy tín hàng đầu, cung cấp các dòng laptop gaming, văn phòng, đồ họa chính hãng.')
  const homeData = useHomeStore((state) => state.homeData)
  const loading = useHomeStore((state) => state.loading)
  const error = useHomeStore((state) => state.error)
  const activeHeroIndex = useHomeStore((state) => state.activeHeroIndex)
  const activeTabId = useHomeStore((state) => state.activeTabId)
  const fetchHomeData = useHomeStore((state) => state.loadHomeData)
  const setActiveHeroIndex = useHomeStore((state) => state.setActiveHeroIndex)
  const nextHero = useHomeStore((state) => state.nextHero)
  const prevHero = useHomeStore((state) => state.prevHero)
  const setActiveTabId = useHomeStore((state) => state.setActiveTabId)

  useEffect(() => {
    fetchHomeData()
  }, [fetchHomeData])

  const viewModel = useMemo(() => buildHomeViewModel(homeData), [homeData])

  const currentHero = viewModel.heroSlides[activeHeroIndex] ?? viewModel.heroSlides[0]

  const selectedProducts = useMemo(() => {
    const list = activeTabId === 'all'
      ? viewModel.featuredProducts
      : viewModel.featuredProducts.filter((product) => String(product.category?.id) === activeTabId)
    
    return [...list].sort((a, b) => Number(b.id) - Number(a.id))
  }, [activeTabId, viewModel.featuredProducts])

  const featuredOverview = selectedProducts.slice(0, 8)

  useEffect(() => {
    if (viewModel.heroSlides.length <= 1) {
      return undefined
    }

    const timer = window.setInterval(() => {
      nextHero(viewModel.heroSlides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [nextHero, viewModel.heroSlides.length])

  useEffect(() => {
    if (activeHeroIndex >= viewModel.heroSlides.length) {
      setActiveHeroIndex(0)
    }
  }, [activeHeroIndex, setActiveHeroIndex, viewModel.heroSlides.length])

  const handlePrevHero = () => prevHero(viewModel.heroSlides.length)
  const handleNextHero = () => nextHero(viewModel.heroSlides.length)
  const handleSelectTab = (tabId) => setActiveTabId(tabId)

  if (error) {
    return <HomeErrorState message={error} />
  }

  return (
    <>
      {loading && <HomeLoadingState />}
      <HomeHeroSection
        categories={viewModel.categories}
        currentHero={currentHero}
        heroSlides={viewModel.heroSlides}
        activeHeroIndex={activeHeroIndex}
        onPrev={handlePrevHero}
        onNext={handleNextHero}
        onSelectSlide={setActiveHeroIndex}
        featuredProductCount={viewModel.stats.featured_product_count}
      />
      <HomeInfoBar />
      <HomeFlashSaleSection products={viewModel.featuredProducts} />
      <HomeTopProducts products={viewModel.topProducts} />
      <HomeFeaturedProducts
        tabs={viewModel.productTabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        products={featuredOverview}
      />
      <HomeSupportBanners />
      <HomeBrandStrip />
      <HomeNewsSection newsCards={viewModel.newsCards} />
    </>
  )
}

export default HomePage