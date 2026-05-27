import { Save, ShieldCheck, Mail, Database, CreditCard } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Cài đặt Hệ thống</h1>
          <p className="text-sm text-slate-500 mt-1">Cấu hình thông tin cửa hàng, thanh toán và bảo mật.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm">
          <Save size={18} /> Lưu thay đổi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Navigation / Tabs mock */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { label: 'Cài đặt chung', icon: Database, active: true },
            { label: 'Thanh toán & Giao hàng', icon: CreditCard },
            { label: 'Cấu hình Email', icon: Mail },
            { label: 'Bảo mật & Phân quyền', icon: ShieldCheck },
          ].map((tab, idx) => (
            <button key={idx} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${tab.active ? 'bg-white border border-slate-200 text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white hover:border-slate-200 border border-transparent'}`}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Thông tin cửa hàng</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên cửa hàng</label>
                  <input type="text" defaultValue="TechZone Store" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email liên hệ</label>
                  <input type="email" defaultValue="contact@techzone.vn" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mô tả ngắn (SEO)</label>
                <textarea rows="3" defaultValue="Cửa hàng Laptop và Thiết bị số hàng đầu Việt Nam." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 resize-none"></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Mạng xã hội</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Facebook URL</label>
                <input type="text" defaultValue="https://facebook.com/techzone" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Instagram URL</label>
                <input type="text" defaultValue="https://instagram.com/techzone" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
