import { Route, Routes } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import HomePage from '../../pages/HomePage/HomePage'
import ProductListPage from '../../pages/ProductListPage'
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage'

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRouter