import { useState, Suspense } from 'react'
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom'
import { 
  Home, ShoppingBag, Box, List, Users, Tag, BarChart2, 
  FileText, Layout, MessageSquare, Folder, 
  UserCog, Shield, Settings, Activity, LogOut,
  Search, Bell, Maximize, Monitor, Menu
} from 'lucide-react'
import RouteSpinner from '../../shared/components/RouteSpinner'
import { useAuth } from '../../contexts/AuthContext'

const SIDEBAR_SECTIONS = [
  {
    title: 'QUẢN LÝ BÁN HÀNG',
    items: [
      { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag, path: '/admin/orders', badge: '128' },
      { id: 'products', label: 'Sản phẩm', icon: Box, path: '/admin/products' },
      { id: 'categories', label: 'Danh mục', icon: List, path: '/admin/categories' },
      { id: 'customers', label: 'Khách hàng', icon: Users, path: '/admin/customers' },
      { id: 'vouchers', label: 'Voucher', icon: Tag, path: '/admin/vouchers' },
      { id: 'revenue', label: 'Báo cáo doanh thu', icon: BarChart2, path: '/admin/revenue' },
    ]
  },
  {
    title: 'NỘI DUNG',
    items: [
      { id: 'posts', label: 'Bài viết', icon: FileText, path: '/admin/posts' },
      { id: 'pages', label: 'Trang', icon: Layout, path: '/admin/pages' },
      { id: 'comments', label: 'Bình luận', icon: MessageSquare, path: '/admin/comments' },
      { id: 'post-categories', label: 'Danh mục bài viết', icon: Folder, path: '/admin/post-categories' },
    ]
  },
  {
    title: 'HỆ THỐNG',
    items: [
      { id: 'users', label: 'Người dùng', icon: UserCog, path: '/admin/users' },
      { id: 'roles', label: 'Vai trò & quyền', icon: Shield, path: '/admin/roles' },
      { id: 'settings', label: 'Cài đặt', icon: Settings, path: '/admin/settings' },
      { id: 'activity', label: 'Nhật ký hoạt động', icon: Activity, path: '/admin/activity' },
    ]
  }
]

export default function AdminLayout() {
  const location = useLocation()
  const { user, loading, isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0F172A]">
        <RouteSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (!user?.is_staff) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#F8FAFC] p-4 text-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-105 flex items-center justify-center mb-4 text-red-500">
            <Shield size={32} />
          </div>
          <h1 className="text-xl font-black text-slate-850 mb-2">Truy cập bị từ chối</h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">Bạn không có quyền truy cập vào trang quản trị này. Vui lòng đăng nhập bằng tài khoản Quản trị viên.</p>
          <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800 font-sans">
      
      {/* ─── Sidebar Overlay ─── */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-[#0F172A] text-slate-300 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Brand */}
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          <Link to="/admin" className="inline-flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xl font-black tracking-tight leading-none text-white">
              <span>TECHZONE</span>
            </div>
            <span className="text-blue-500 text-[10px] font-bold tracking-widest mt-0.5 relative after:absolute after:top-1/2 after:-right-4 after:w-3 after:h-px after:bg-blue-500 before:absolute before:top-1/2 before:-left-4 before:w-3 before:h-px before:bg-blue-500">ADMIN</span>
          </Link>
        </div>

        {/* Scrollable Nav */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 custom-scrollbar">
          
          {/* Dashboard Tab */}
          <Link 
            to="/admin"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              location.pathname === '/admin' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20' 
                : 'hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Home size={18} />
            Tổng quan
          </Link>

          {/* Sections */}
          {SIDEBAR_SECTIONS.map((section, sIdx) => (
            <div key={sIdx}>
              <h3 className="px-4 text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2.5">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map(item => {
                  const isActive = location.pathname.startsWith(item.path)
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600/10 text-blue-400'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} />
                        {item.label}
                      </div>
                      {item.badge && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action */}
        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-700 text-sm font-medium hover:bg-slate-800 hover:text-white transition-all text-slate-400">
            <LogOut size={18} />
            Đăng xuất
          </Link>
        </div>
      </aside>

      {/* ─── Main Content Wrapper ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 z-10 shrink-0">
          
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="lg:hidden text-slate-500 hover:text-slate-700 p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="relative w-full max-w-sm hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Tìm kiếm (Ctrl + K)..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
              <Monitor size={18} />
            </button>
            <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">5</span>
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors hidden sm:flex">
              <Maximize size={18} />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                AD
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">Admin</p>
                <p className="text-xs text-slate-500">Quản trị viên</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 custom-scrollbar relative">
          <Suspense fallback={<RouteSpinner />}>
            <Outlet />
          </Suspense>
        </main>

      </div>
    </div>
  )
}
