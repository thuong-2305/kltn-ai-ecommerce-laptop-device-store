import { useState } from 'react'
import { Plus, Minus, HelpCircle } from 'lucide-react'
import StaticLayout from './components/StaticLayout'

export default function FaqsPage() {
  const [openIdx, setOpenIdx] = useState(null)

  const items = [
    { q: 'Tôi có thể mua trả góp trực tuyến không?', a: 'Có, LaptopDevice hỗ trợ chương trình mua trả góp 0% lãi suất thông qua thẻ tín dụng liên kết của hơn 25 ngân hàng hoặc trả góp qua công ty tài chính (Home Credit, FE Credit).' },
    { q: 'Sản phẩm lỗi phần cứng sẽ được đổi trả thế nào?', a: 'Đối với sản phẩm có lỗi phần cứng từ nhà sản xuất, bạn được hỗ trợ đổi sang sản phẩm mới tương đương miễn phí 100% trong vòng 30 ngày kể từ lúc nhận hàng.' },
    { q: 'Chính sách giao hàng của shop có hỗ trợ tỉnh xa không?', a: 'LaptopDevice giao hàng trên toàn bộ 63 tỉnh thành Việt Nam thông qua các đối tác tin cậy (Viettel Post, GHTK). Mọi đơn hàng giá trị cao đều được đóng thùng xốp gỗ chống va đập và bảo hiểm hàng hóa 100%.' }
  ]

  return (
    <StaticLayout title="Câu hỏi thường gặp">
      <div className="space-y-6">
        <p className="text-slate-500 text-sm leading-relaxed">
          Tìm kiếm nhanh câu trả lời cho các thắc mắc phổ biến của khách hàng về dịch vụ, vận chuyển, đổi trả và thanh toán tại LaptopDevice.
        </p>

        <div className="space-y-3.5">
          {items.map((item, idx) => {
            const isOpen = openIdx === idx
            return (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-slate-800 hover:bg-slate-100/50 hover:text-blue-600 transition-colors gap-4"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-blue-500" />
                    {item.q}
                  </span>
                  <span className="shrink-0 text-slate-400 bg-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                    {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                  </span>
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-40 border-t border-slate-200' : 'max-h-0'}`}>
                  <p className="p-4 text-xs text-slate-500 leading-relaxed bg-white">{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </StaticLayout>
  )
}
