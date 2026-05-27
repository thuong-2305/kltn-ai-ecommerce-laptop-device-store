import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useHomeStore } from '../features/home/store/useHomeStore'
import { EMPTY_ARRAY } from '../features/home/utils/homeViewModel'
import TopStrip from '../shared/components/TopStrip'
import SiteHeader from '../shared/components/SiteHeader'
import MainNav from '../shared/components/MainNav'
import SiteFooter from '../shared/components/SiteFooter'
import BackToTopButton from '../shared/components/BackToTopButton'
import RouteSpinner from '../shared/components/RouteSpinner'

function MainLayout() {
  const categories = useHomeStore((state) => state.homeData?.categories ?? EMPTY_ARRAY)

  return (
    <div className="app-shell">
      <TopStrip />
      <SiteHeader categories={categories} cartCount={0} />
      <MainNav />
      <main className="flex flex-col flex-1">
        <Suspense fallback={<RouteSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      <BackToTopButton />
    </div>
  )
}

export default MainLayout