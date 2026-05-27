import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, HelpCircle, ArrowRight, ShieldCheck, HeartHandshake, Truck, RotateCcw, Award, Plus, Minus } from 'lucide-react'
import StaticLayout from './components/StaticLayout'

/* ─── Premium SVG Illustrations for Purchase Steps ─── */
function SelectProductSvg() {
  return (
    <svg className="w-full h-full text-blue-600" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="10" width="70" height="46" rx="6" fill="#F1F5F9" stroke="currentColor" strokeWidth="3" />
      <rect x="22" y="16" width="56" height="34" rx="4" fill="#FFFFFF" />
      <path d="M10 65H90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M35 56L42 65H58L65 56" fill="#E2E8F0" stroke="currentColor" strokeWidth="3" />
      <circle cx="50" cy="33" r="12" fill="none" stroke="#0EA5E9" strokeWidth="3" />
      <line x1="58.5" y1="41.5" x2="72" y2="55" stroke="#0EA5E9" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

function AddToCartSvg() {
  return (
    <svg className="w-full h-full text-blue-600" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="66" r="6" fill="currentColor" />
      <circle cx="68" cy="66" r="6" fill="currentColor" />
      <path d="M15 15H25L36 50H72L82 23H28" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="56" cy="34" r="14" fill="#0EA5E9" />
      <path d="M50 34H62M56 28V40" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function CheckCartSvg() {
  return (
    <svg className="w-full h-full text-blue-600" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="12" width="50" height="60" rx="6" fill="#F8FAFC" stroke="currentColor" strokeWidth="3.5" />
      <rect x="38" y="6" width="24" height="10" rx="3" fill="#E2E8F0" stroke="currentColor" strokeWidth="2.5" />
      <line x1="36" y1="28" x2="64" y2="28" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      <line x1="36" y1="40" x2="64" y2="40" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      <line x1="36" y1="52" x2="56" y2="52" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      <circle cx="64" cy="52" r="7" fill="#10B981" />
      <path d="M60.5 52L63 54.5L67.5 50" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EnterInfoSvg() {
  return (
    <svg className="w-full h-full text-blue-600" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="15" width="64" height="46" rx="8" fill="#F8FAFC" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="34" cy="30" r="6" fill="#0EA5E9" />
      <path d="M24 45C24 40 28 37 34 37C40 37 44 40 44 45" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="52" y1="26" x2="72" y2="26" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="52" y1="36" x2="72" y2="36" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="52" y1="46" x2="66" y2="46" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

function PaymentSvg() {
  return (
    <svg className="w-full h-full text-blue-600" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="18" width="68" height="44" rx="6" fill="#F8FAFC" stroke="currentColor" strokeWidth="3.5" />
      <rect x="16" y="27" width="68" height="10" fill="currentColor" />
      <rect x="24" y="45" width="16" height="8" rx="2" fill="#E2E8F0" />
      <circle cx="62" cy="49" r="6" fill="#EF4444" fillOpacity="0.8" />
      <circle cx="70" cy="49" r="6" fill="#FBBF24" fillOpacity="0.8" />
    </svg>
  )
}

function ShippingSvg() {
  return (
    <svg className="w-full h-full text-blue-600" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 22H62V58H15V22Z" fill="#F8FAFC" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M62 30H78L85 43V58H62V30Z" fill="#E2E8F0" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="28" cy="62" r="7" fill="currentColor" />
      <circle cx="68" cy="62" r="7" fill="currentColor" />
      <line x1="45" y1="40" x2="52" y2="40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="38" y1="48" x2="52" y2="48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export default function GuidePage() {
  const [openFaq, setOpenFaq] = useState(null)

  const steps = [
    {
      n: 1,
      title: 'Chọn sản phẩm',
      desc: 'Tìm kiếm và lựa chọn sản phẩm phù hợp với nhu cầu của bạn.',
      svg: SelectProductSvg,
    },
    {
      n: 2,
      title: 'Thêm vào giỏ',
      desc: 'Nhấn "Thêm vào giỏ hàng" để lưu sản phẩm bạn muốn mua.',
      svg: AddToCartSvg,
    },
    {
      n: 3,
      title: 'Kiểm tra giỏ hàng',
      desc: 'Kiểm tra sản phẩm, số lượng và chọn "Tiến hành thanh toán".',
      svg: CheckCartSvg,
    },
    {
      n: 4,
      title: 'Nhập thông tin',
      desc: 'Nhập đầy đủ thông tin giao hàng và chọn phương thức vận chuyển.',
      svg: EnterInfoSvg,
    },
    {
      n: 5,
      title: 'Thanh toán',
      desc: 'Chọn phương thức thanh toán phù hợp và hoàn tất đơn hàng.',
      svg: PaymentSvg,
    },
    {
      n: 6,
      title: 'Nhận hàng',
      desc: 'TechZone xác nhận đơn hàng và giao hàng đến bạn nhanh chóng.',
      svg: ShippingSvg,
    },
  ]

  const faqs = [
    {
      q: 'Tôi có thể thay đổi hoặc hủy đơn hàng không?',
      a: 'Bạn có thể thay đổi hoặc hủy đơn hàng trước khi đơn hàng được đóng gói và bàn giao cho đơn vị vận chuyển. Vui lòng liên hệ Hotline 1900 1234 hoặc Chat trực tiếp để nhân viên kịp thời hỗ trợ thay đổi cấu hình hoặc địa chỉ nhận hàng.',
    },
    {
      q: 'Thời gian giao hàng dự kiến là bao lâu?',
      a: 'Thời gian giao hàng tiêu chuẩn dao động từ 2-4 ngày làm việc trên toàn quốc. Đối với đơn hàng nội thành TP. HCM và Hà Nội, TechZone hỗ trợ giao hàng hỏa tốc trong vòng 1-2 giờ hoặc nhận trực tiếp tại cửa hàng gần nhất.',
    },
    {
      q: 'Tôi có được kiểm tra hàng trước khi thanh toán không?',
      a: 'Tất cả sản phẩm bán ra bởi TechZone đều hỗ trợ chính sách "Đồng kiểm khi nhận hàng". Bạn được quyền mở niêm phong hộp của hãng để đối chiếu mã máy, phụ kiện đi kèm và trạng thái ngoại quan của máy trước khi hoàn tất ký nhận hoặc trả tiền.',
    },
  ]

  const features = [
    { icon: ShieldCheck, title: 'Sản phẩm chính hãng', desc: '100% chính hãng, đầy đủ hóa đơn VAT' },
    { icon: Award, title: 'Giá tốt nhất', desc: 'Cam kết giá cạnh tranh nhất thị trường' },
    { icon: Truck, title: 'Giao hàng nhanh chóng', desc: 'Giao hàng toàn quốc, nhanh từ 1-3 ngày' },
    { icon: RotateCcw, title: 'Đổi trả dễ dàng', desc: 'Đổi trả trong 30 ngày nếu có lỗi từ nhà sản xuất' },
    { icon: HeartHandshake, title: 'Bảo hành uy tín', desc: 'Bảo hành chính hãng tại các trung tâm ủy quyền' },
  ]

  return (
    <StaticLayout title="Hướng dẫn mua hàng">
      {/* ── Title Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-sky-50/50 rounded-2xl border border-blue-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_30%)]" />
        <div className="relative z-10 flex-1 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">Hướng dẫn mua hàng</h2>
          <p className="text-slate-500 text-sm md:text-base max-w-xl">
            Quy trình mua hàng đơn giản, nhanh chóng và an toàn tại TechZone giúp bạn sở hữu sản phẩm công nghệ mơ ước chỉ trong vài bước.
          </p>
        </div>
        <div className="relative z-10 w-28 h-28 md:w-36 md:h-36 flex-none bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
          <svg className="w-16 h-16 md:w-20 md:h-20 text-blue-600 animate-bounce duration-1000" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      </div>

      {/* ── Quy trình mua hàng tại TechZone (Diagram) ── */}
      <div className="mb-12">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6 border-l-4 border-blue-600 pl-3">Quy trình mua hàng tại TechZone</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-3.5 items-stretch relative">
          {steps.map((step, idx) => {
            const IconComponent = step.svg
            return (
              <div key={step.n} className="flex flex-col items-center relative group h-full">
                {/* Step card */}
                <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow duration-300 relative pt-7 flex-1 h-full">
                  {/* Badge */}
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center border-4 border-white shadow-sm">
                    {step.n}
                  </span>
                  
                  {/* Visual Svg */}
                  <div className="w-20 h-16 mb-3.5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0">
                    <IconComponent />
                  </div>
                  
                  {/* Title & Desc */}
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors shrink-0">{step.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal flex-1">{step.desc}</p>
                </div>

                {/* Arrow Connector (Hidden on last card, visible on desktop/large screens) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 text-slate-300 font-bold text-lg pointer-events-none group-hover:text-blue-500 transition-colors">
                    »
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Chi tiết quy trình mua hàng ── */}
      <div className="mb-12">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6 border-l-4 border-blue-600 pl-3">Hướng dẫn chi tiết</h3>
        
        <div className="space-y-4">
          {[
            { n: '1. Chọn sản phẩm', text: 'Bạn có thể tìm kiếm sản phẩm theo tên, danh mục hoặc thương hiệu trên thanh tìm kiếm. Lựa chọn cấu hình, màu sắc và dung lượng bộ nhớ phù hợp. Xem chi tiết thông số kỹ thuật, bảo hành và khuyến mãi của sản phẩm trước khi quyết định.', svg: SelectProductSvg },
            { n: '2. Thêm vào giỏ hàng', text: 'Sau khi đã chọn sản phẩm ưng ý, bạn click vào nút "Thêm vào giỏ hàng" để tiếp tục xem thêm các linh kiện phụ kiện đi kèm hoặc click nút "Mua ngay" để trực tiếp chuyển hướng đến trang giỏ hàng và thanh toán.', svg: AddToCartSvg },
            { n: '3. Kiểm tra thông tin giỏ hàng', text: 'Tại trang giỏ hàng, bạn có thể kiểm tra danh sách sản phẩm, điều chỉnh số lượng mua, nhập mã giảm giá (nếu có) để hưởng ưu đãi. Xem lại tổng thành tiền tạm tính và bấm chọn "Tiến hành thanh toán".', svg: CheckCartSvg },
            { n: '4. Nhập thông tin giao hàng', text: 'Vui lòng cung cấp đầy đủ và chính xác thông tin nhận hàng bao gồm: Họ tên người nhận, số điện thoại liên lạc, địa chỉ cụ thể (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố) để đảm bảo bưu tá giao hàng chính xác.', svg: EnterInfoSvg },
            { n: '5. Thanh toán đơn hàng', text: 'TechZone hỗ trợ đa dạng phương thức thanh toán an toàn bao gồm: COD (giao hàng nhận tiền mặt), Chuyển khoản ngân hàng trực tiếp qua mã QR, Thẻ ATM/Internet Banking, Thẻ quốc tế Visa/MasterCard hoặc các ví điện tử Momo/Zalopay.', svg: PaymentSvg },
            { n: '6. Nhận hàng và đồng kiểm', text: 'Đơn hàng sẽ được nhân viên hỗ trợ gọi điện xác nhận trong 15 phút. Khi bưu tá bàn giao hàng, bạn có quyền mở hộp ngoài để đồng kiểm ngoại quan sản phẩm cùng bưu tá. Nếu sản phẩm khớp thông tin và nguyên vẹn, bạn tiến hành ký nhận hàng.', svg: ShippingSvg }
          ].map((item, idx) => {
            const SvgIllust = item.svg
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-all duration-300">
                {/* Visual Circle */}
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                  <HelpCircle size={22} />
                </div>
                
                {/* Description Text */}
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-sm font-black text-slate-900 mb-1.5 uppercase tracking-tight">{item.n}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.text}</p>
                </div>
                
                {/* Side Graphic Mockup */}
                <div className="w-24 h-16 shrink-0 bg-slate-50/50 rounded-xl p-1 flex items-center justify-center border border-slate-100 shadow-inner">
                  <SvgIllust />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Vì sao nên mua hàng tại TechZone? ── */}
      <div className="mb-12 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-blue-800/30">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
        
        <h3 className="relative z-10 text-center font-black text-sm uppercase tracking-widest text-blue-300 mb-6">Vì sao nên mua hàng tại TechZone?</h3>
        
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 text-center items-start">
          {features.map((feature, idx) => {
            const FeatureIcon = feature.icon
            return (
              <div key={idx} className="flex flex-col items-center gap-2 p-2 group">
                <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 border border-white/10 shadow-inner">
                  <FeatureIcon size={20} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-tight text-white/95 mt-1">{feature.title}</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed max-w-[150px]">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── FAQs & Articles Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FAQs Accordions */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 h-full flex flex-col">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-5 border-l-4 border-blue-600 pl-3">Câu hỏi thường gặp</h3>
          
          <div className="space-y-3 flex-1">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 bg-slate-50/50">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-slate-800 hover:bg-slate-100/70 hover:text-blue-600 transition-colors gap-4"
                  >
                    <span>{faq.q}</span>
                    <span className="shrink-0 text-slate-400 bg-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                      {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                    </span>
                  </button>
                  
                  <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-40 border-t border-slate-200' : 'max-h-0'}`}>
                    <p className="p-4 text-xs text-slate-500 leading-relaxed bg-white">{faq.a}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 text-left border-t border-slate-100 pt-4">
            <Link to="/faqs" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
              Xem tất cả câu hỏi <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 h-full">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-5 border-l-4 border-blue-600 pl-3">Bài viết liên quan</h3>
          
          <div className="space-y-4">
            {[
              { title: 'Hướng dẫn thanh toán tại TechZone', desc: 'Các phương thức thanh toán và lưu ý quan trọng.', path: '/payment-guide', gradient: 'from-orange-500 to-amber-400' },
              { title: 'Chính sách giao hàng của TechZone', desc: 'Thông tin chi tiết về phí và thời gian giao hàng.', path: '/shipping-policy', gradient: 'from-blue-600 to-cyan-500' },
              { title: 'Chính sách đổi trả hàng tại TechZone', desc: 'Quy định và điều kiện đổi trả linh hoạt.', path: '/return-policy', gradient: 'from-emerald-600 to-teal-400' }
            ].map((article, idx) => (
              <Link key={idx} to={article.path} className="flex gap-4 p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-sm transition-all duration-300 group">
                {/* Card thumbnail representation */}
                <div className={`w-16 h-12 rounded-lg bg-gradient-to-br ${article.gradient} flex items-center justify-center text-white shrink-0 shadow-sm font-black text-lg select-none`}>
                  TZ
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">{article.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{article.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </StaticLayout>
  )
}
