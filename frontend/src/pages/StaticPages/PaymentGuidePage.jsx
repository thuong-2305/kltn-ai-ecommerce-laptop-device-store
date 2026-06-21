import StaticLayout from './components/StaticLayout'
import { ShieldCheck, Landmark, CreditCard, DollarSign } from 'lucide-react'

export default function PaymentGuidePage() {
  const paymentMethods = [
    { icon: DollarSign, name: 'Thanh toán tiền mặt (COD)', desc: 'Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng sau khi hoàn tất kiểm tra sản phẩm.' },
    { icon: Landmark, name: 'Chuyển khoản ngân hàng trực tiếp', desc: 'Chuyển tiền vào tài khoản TechZone bằng cách quét mã QR ngân hàng hoặc nhập thông tin STK thủ công.' },
    { icon: CreditCard, name: 'Thanh toán qua thẻ ATM / Visa / Mastercard', desc: 'Hỗ trợ tất cả thẻ nội địa và thẻ tín dụng/ghi nợ quốc tế bảo mật tuyệt đối qua cổng Napas.' }
  ]

  return (
    <StaticLayout title="Hướng dẫn thanh toán">
      <div className="space-y-6">
        <p className="text-slate-500 text-sm leading-relaxed">
          TechZone hỗ trợ quý khách hàng đa dạng phương thức thanh toán an toàn, bảo mật và linh hoạt. Quý khách vui lòng tham khảo chi tiết bên dưới.
        </p>

        <div className="space-y-4">
          {paymentMethods.map((method, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 flex gap-4 items-start shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <method.icon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">{method.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{method.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex gap-2 items-center">
          <ShieldCheck size={16} className="text-blue-600 shrink-0" />
          <span>Mọi giao dịch thanh toán tại TechZone đều được mã hóa SSL/TLS bảo mật tuyệt đối 100%.</span>
        </div>
      </div>
    </StaticLayout>
  )
}
