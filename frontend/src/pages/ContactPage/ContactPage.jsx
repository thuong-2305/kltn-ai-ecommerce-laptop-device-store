import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [status, setStatus] = useState({ type: '', msg: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập gọi API gửi tin nhắn
    setTimeout(() => {
      setIsSubmitting(false)
      setStatus({ type: 'success', msg: 'Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể!' })
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })

      setTimeout(() => setStatus({ type: '', msg: '' }), 5000)
    }, 1500)
  }

  return (
    <div className="mx-4.5 py-6 pb-16">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm">
        <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium">Trang chủ</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-blue-600 font-semibold">Liên hệ</span>
      </nav>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Liên hệ với chúng tôi</h1>
        <p className="text-slate-500 mt-2">LaptopDevice luôn lắng nghe và sẵn sàng hỗ trợ mọi thắc mắc của bạn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 items-start">

        {/* ── TRÁI: THÔNG TIN & BẢN ĐỒ ── */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h3 className="font-bold text-lg text-slate-900 mb-6">Thông tin liên hệ</h3>

            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Địa chỉ cửa hàng</p>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">123 Đường ABC, Phường 1, Quận 1, TP. Hồ Chí Minh</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Điện thoại</p>
                  <p className="text-blue-600 font-bold text-sm mt-1">1900 1234</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Email hỗ trợ</p>
                  <p className="text-slate-600 text-sm mt-1">support@laptopdevice.vn</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Giờ làm việc</p>
                  <p className="text-slate-600 text-sm mt-1">Thứ 2 - Thứ 7: 08:00 - 21:00<br />Chủ nhật: 08:00 - 17:30</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bản đồ */}
          <div className="bg-slate-200 rounded-2xl overflow-hidden h-[300px] border border-slate-200 shadow-sm relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674197255!2d106.69871731533423!3d10.778841192319985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f48a3b02751%3A0x2db4283c74384eb9!2sNotre%20Dame%20Cathedral%20of%20Saigon!5e0!3m2!1sen!2s!4v1684300000000!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="LaptopDevice Map"
            ></iframe>
          </div>
        </div>

        {/* ── PHẢI: FORM LIÊN HỆ ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h3 className="font-bold text-lg text-slate-900 mb-2">Gửi tin nhắn cho chúng tôi</h3>
          <p className="text-sm text-slate-500 mb-6">Vui lòng điền thông tin bên dưới, chúng tôi sẽ liên hệ lại ngay.</p>

          {status.msg && (
            <div className={`mb-6 flex items-start gap-3 p-4 rounded-xl border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {status.type === 'success' ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : <AlertCircle size={20} className="shrink-0 mt-0.5" />}
              <p className="text-sm font-medium">{status.msg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Họ và tên <span className="text-red-500">*</span></label>
                <input
                  type="text" name="name" required
                  value={formData.name} onChange={handleChange}
                  placeholder="Nhập họ và tên..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Số điện thoại <span className="text-red-500">*</span></label>
                <input
                  type="tel" name="phone" required
                  value={formData.phone} onChange={handleChange}
                  placeholder="Nhập số điện thoại..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Email</label>
              <input
                type="email" name="email"
                value={formData.email} onChange={handleChange}
                placeholder="Nhập địa chỉ email..."
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Chủ đề <span className="text-red-500">*</span></label>
              <input
                type="text" name="subject" required
                value={formData.subject} onChange={handleChange}
                placeholder="Vấn đề bạn đang quan tâm..."
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Nội dung chi tiết <span className="text-red-500">*</span></label>
              <textarea
                name="message" required rows={5}
                value={formData.message} onChange={handleChange}
                placeholder="Nhập chi tiết nội dung cần hỗ trợ..."
                className="w-full px-4 pt-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 mt-2 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><Send size={16} /> Gửi tin nhắn</>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
