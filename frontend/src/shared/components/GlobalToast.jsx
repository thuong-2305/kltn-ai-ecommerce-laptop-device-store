import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'

export default function GlobalToast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleShowToast = (event) => {
      const { message, type, duration } = event.detail
      const id = Date.now() + Math.random().toString(36).substring(2, 9)
      
      const newToast = { id, message, type: type || 'success' }
      setToasts((prev) => [newToast, ...prev])

      // Auto remove after duration
      setTimeout(() => {
        removeToast(id)
      }, duration || 3000)
    }

    window.addEventListener('show_toast', handleShowToast)
    return () => {
      window.removeEventListener('show_toast', handleShowToast)
    }
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success'
        const isCartMsg = toast.message.toLowerCase().includes('giỏ hàng') || toast.message.toLowerCase().includes('giỏ')

        return (
          <div
            key={toast.id}
            className={`w-full bg-white/95 backdrop-blur-md border shadow-[0_10px_30px_rgba(0,0,0,0.12)] rounded-2xl p-4 flex gap-3.5 items-center pointer-events-auto transition-all duration-300 animate-in slide-in-from-top-4 ${
              isSuccess ? 'border-green-200 text-green-800' : 'border-red-200 text-red-800'
            }`}
          >
            {/* Icon */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isSuccess ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold leading-snug">{toast.message}</p>
              {isSuccess && isCartMsg && (
                <Link
                  to="/cart"
                  className="text-xs font-extrabold text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap ml-1 shrink-0"
                >
                  Xem giỏ →
                </Link>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-650 p-0.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
