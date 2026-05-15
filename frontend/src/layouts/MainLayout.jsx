import { Outlet, useLocation } from 'react-router-dom'
import { useHomeStore } from '../features/home/store/useHomeStore'
import { EMPTY_ARRAY } from '../features/home/utils/homeViewModel'
import { SEMANTIC_CLASSES } from '../constants/designSystem'
import TopStrip from '../shared/components/TopStrip'
import SiteHeader from '../shared/components/SiteHeader'
import MainNav from '../shared/components/MainNav'
import SiteFooter from '../shared/components/SiteFooter'
import BackToTopButton from '../shared/components/BackToTopButton'

function MainLayout() {
  const categories = useHomeStore((state) => state.homeData?.categories ?? EMPTY_ARRAY)
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="app-shell">
      {isHomePage ? (
        <div className={`overflow-hidden rounded-none border ${SEMANTIC_CLASSES.BORDER.DEFAULT} bg-white ${SEMANTIC_CLASSES.SHADOW.NONE} backdrop-blur-none`}>
          <TopStrip />
          <SiteHeader categories={categories} cartCount={0} />
          <MainNav />
          <main className="flex flex-col gap-4 px-0 pb-1">
            <Outlet />
          </main>
        </div>
      ) : (
        <>
          <TopStrip />
          <SiteHeader categories={categories} cartCount={0} />
          <MainNav />
          <main className="flex flex-col gap-4">
            <Outlet />
          </main>
        </>
      )}
      <SiteFooter />
      <BackToTopButton />
    </div>
  )
}

export default MainLayout