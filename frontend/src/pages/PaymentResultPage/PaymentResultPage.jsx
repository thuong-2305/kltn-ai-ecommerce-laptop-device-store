import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, ChevronRight, Package, CreditCard, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, Sparkles } from 'lucide-react'
import axios from 'axios'

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + '₫'

function PaymentResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const success = searchParams.get('success') === 'true'
  const orderCode = searchParams.get('order_code') || ''
  const message = searchParams.get('message') || ''

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderCode) {
        setLoading(false)
        return
      }
      try {
        const token = localStorage.getItem('ld_access')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        
        // Fetch order details directly by order code
        const res = await axios.get(`http://localhost:8000/api/payment/orders/${orderCode}/detail/`, { headers })
        if (res.data) {
          setOrder(res.data)
        }
      } catch (err) {
        console.error('Error fetching order details:', err)
        setError('Không thể tải thông tin đơn hàng.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderCode])

  const handleRetryPayment = async () => {
    if (!orderCode) return
    setRetrying(true)
    setError('')
    try {
      const token = localStorage.getItem('ld_access')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.post('http://localhost:8000/api/payment/vnpay_checkout/', {
        order_code: orderCode
      }, { headers })

      if (res.data && res.data.payment_url) {
        window.location.href = res.data.payment_url
      } else {
        setError('Không tạo được URL thanh toán mới. Vui lòng thử lại.')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi thử lại thanh toán.')
    } finally {
      setRetrying(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-4.5 py-12 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Đang kiểm tra kết quả giao dịch...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4.5 py-6 pb-16 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm">
        <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium">Trang chủ</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-blue-600 font-semibold">Kết quả thanh toán</span>
      </nav>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {/* Header decoration */}
        <div className={`h-2 w-full ${success ? 'bg-green-500' : 'bg-red-500'}`} />

        <div className="p-8 flex flex-col items-center text-center">
          {success ? (
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4 text-green-500">
              <CheckCircle2 size={48} className="animate-pulse" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
              <XCircle size={48} />
            </div>
          )}

          <h1 className="text-2xl font-black text-slate-900 mb-2">
            {success ? (
              <span className="flex items-center justify-center gap-1.5">
                Thanh toán thành công!
                <Sparkles size={22} className="text-amber-500 fill-amber-300 animate-pulse shrink-0" />
              </span>
            ) : 'Thanh toán thất bại'}
          </h1>
          
          <p className="text-sm text-slate-500 max-w-md mb-6">
            {success 
              ? 'Cảm ơn bạn đã lựa chọn mua sắm tại LaptopDevice. Giao dịch trực tuyến của bạn đã được xác thực an toàn.' 
              : message || 'Đã có lỗi xảy ra hoặc bạn đã hủy giao dịch thanh toán.'}
          </p>

          {/* Details list */}
          <div className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-5 text-left mb-6 space-y-3.5">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200/60">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Chi tiết giao dịch</span>
              <span className="flex items-center gap-1 font-bold text-green-600">
                <ShieldCheck size={14} /> Cổng VNPAY
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Mã đơn hàng</span>
              <span className="font-black text-slate-900">#{orderCode}</span>
            </div>

            {order && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tổng thanh toán</span>
                  <span className="font-black text-blue-600">{fmt(order.amount_paid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Người nhận hàng</span>
                  <span className="font-semibold text-slate-900">{order.full_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Số điện thoại</span>
                  <span className="font-semibold text-slate-900">{order.phone}</span>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="w-full flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 font-bold mb-6 text-left">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            {success ? (
              <>
                <button
                  onClick={() => navigate(`/order-tracking/${order?.id || orderCode}`)}
                  className="px-6 h-11 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Package size={15} /> Theo dõi đơn hàng
                </button>
                <Link
                  to="/"
                  className="px-6 h-11 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all flex items-center justify-center"
                >
                  Quay lại Trang chủ
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleRetryPayment}
                  disabled={retrying}
                  className="px-6 h-11 rounded-xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {retrying ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" /> Đang chuẩn bị...
                    </>
                  ) : (
                    <>
                      Thử lại thanh toán <ArrowRight size={15} />
                    </>
                  )}
                </button>
                <Link
                  to="/profile"
                  className="px-6 h-11 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all flex items-center justify-center"
                >
                  Lịch sử đơn hàng
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentResultPage
