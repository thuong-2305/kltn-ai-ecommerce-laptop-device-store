import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import AdminLayout from '../../layouts/AdminLayout'
import RouteSpinner from '../../shared/components/RouteSpinner'


// Lazy loaded client pages
const HomePage = lazy(() => import('../../pages/HomePage/HomePage'))
const ProductListPage = lazy(() => import('../../pages/ProductListPage'))
const ProductDetailPage = lazy(() => import('../../pages/ProductDetailPage'))
const CartPage = lazy(() => import('../../pages/CartPage'))
const AuthPage = lazy(() => import('../../pages/AuthPage'))
const ProfilePage = lazy(() => import('../../pages/ProfilePage'))
const CheckoutPage = lazy(() => import('../../pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('../../pages/OrderSuccessPage'))
const PaymentResultPage = lazy(() => import('../../pages/PaymentResultPage/PaymentResultPage'))
const OrderTrackingPage = lazy(() => import('../../pages/OrderTrackingPage'))
const ReviewPage = lazy(() => import('../../pages/ReviewPage'))
const ContactPage = lazy(() => import('../../pages/ContactPage'))
const SearchPage = lazy(() => import('../../pages/SearchPage'))
const FlashSalePage = lazy(() => import('../../pages/FlashSalePage'))
const ForgotPasswordPage = lazy(() => import('../../pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../../pages/ResetPasswordPage'))

// Lazy loaded static pages
const AboutPage = lazy(() => import('../../pages/StaticPages').then(m => ({ default: m.AboutPage })))
const WarrantyPolicyPage = lazy(() => import('../../pages/StaticPages').then(m => ({ default: m.WarrantyPolicyPage })))
const ShippingPolicyPage = lazy(() => import('../../pages/StaticPages').then(m => ({ default: m.ShippingPolicyPage })))
const ReturnPolicyPage = lazy(() => import('../../pages/StaticPages').then(m => ({ default: m.ReturnPolicyPage })))
const PrivacyPolicyPage = lazy(() => import('../../pages/StaticPages').then(m => ({ default: m.PrivacyPolicyPage })))
const GuidePage = lazy(() => import('../../pages/StaticPages').then(m => ({ default: m.GuidePage })))
const PaymentGuidePage = lazy(() => import('../../pages/StaticPages').then(m => ({ default: m.PaymentGuidePage })))
const FaqsPage = lazy(() => import('../../pages/StaticPages').then(m => ({ default: m.FaqsPage })))

// Other features
const AiSentimentPage = lazy(() => import('../../pages/AiSentimentPage'))
const PromotionsPage = lazy(() => import('../../pages/PromotionsPage'))
const BlogListPage = lazy(() => import('../../pages/BlogListPage'))
const BlogDetailPage = lazy(() => import('../../pages/BlogDetailPage'))

// Lazy loaded admin pages
const AdminDashboardPage = lazy(() => import('../../pages/AdminDashboardPage'))
const AdminProductsPage = lazy(() => import('../../pages/AdminDashboardPage/AdminProductsPage'))
const AdminOrdersPage = lazy(() => import('../../pages/AdminDashboardPage/AdminOrdersPage'))
const AdminCustomersPage = lazy(() => import('../../pages/AdminDashboardPage/AdminCustomersPage'))
const AdminCategoriesPage = lazy(() => import('../../pages/AdminDashboardPage/AdminCategoriesPage'))
const AdminVouchersPage = lazy(() => import('../../pages/AdminDashboardPage/AdminVouchersPage'))
const AdminPostsPage = lazy(() => import('../../pages/AdminDashboardPage/AdminPostsPage'))
const AdminCommentsPage = lazy(() => import('../../pages/AdminDashboardPage/AdminCommentsPage'))
const AdminUsersPage = lazy(() => import('../../pages/AdminDashboardPage/AdminUsersPage'))
const AdminSettingsPage = lazy(() => import('../../pages/AdminDashboardPage/AdminSettingsPage'))
const AdminGenericCrudPage = lazy(() => import('../../pages/AdminDashboardPage/AdminGenericCrudPage'))
const NotFoundPage = lazy(() => import('../../pages/NotFoundPage/NotFoundPage'))

function AppRouter() {
  return (
    <Suspense fallback={<RouteSpinner />}>
      <Routes>
        {/* Auth page — standalone, no MainLayout */}
        <Route path="auth" element={<AuthPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />

        {/* App pages — inside MainLayout */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-success/:id" element={<OrderSuccessPage />} />
          <Route path="payment/result" element={<PaymentResultPage />} />
          <Route path="order-tracking/:id" element={<OrderTrackingPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="review/:productId" element={<ReviewPage />} />
          <Route path="ai-sentiment/:productId" element={<AiSentimentPage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="blog" element={<BlogListPage />} />
          <Route path="blog/:id" element={<BlogDetailPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="flash-sale" element={<FlashSalePage />} />
          
          {/* Static & Legal Pages */}
          <Route path="about" element={<AboutPage />} />
          <Route path="warranty-policy" element={<WarrantyPolicyPage />} />
          <Route path="shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="return-policy" element={<ReturnPolicyPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="guide" element={<GuidePage />} />
          <Route path="payment-guide" element={<PaymentGuidePage />} />
          <Route path="faqs" element={<FaqsPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin pages — inside AdminLayout */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="vouchers" element={<AdminVouchersPage />} />
          <Route path="posts" element={<AdminPostsPage />} />
          <Route path="comments" element={<AdminCommentsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          
          {/* Generic routes for all other tabs */}
          <Route path="revenue" element={<AdminGenericCrudPage />} />
          <Route path="pages" element={<AdminGenericCrudPage />} />
          <Route path="post-categories" element={<AdminGenericCrudPage />} />
          <Route path="roles" element={<AdminGenericCrudPage />} />
          <Route path="activity" element={<AdminGenericCrudPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRouter