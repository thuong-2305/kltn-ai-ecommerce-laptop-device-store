import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { X, CheckCircle2, Truck, Bell, ExternalLink } from 'lucide-react'

export default function WebSocketNotification() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
      setNotifications([])
      return
    }

    const token = localStorage.getItem('ld_access')
    if (!token) return

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    // Local development backend runs on port 8000
    const wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws/notifications/?token=${token}`

    console.log('[WebSocket] Connecting to:', wsUrl)
    const socket = new WebSocket(wsUrl)
    socketRef.current = socket

    socket.onopen = () => {
      console.log('[WebSocket] Connected successfully')
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('[WebSocket] Received message:', data)
        
        const newNotification = {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          message: data.message,
          type: data.notification_type || 'order_update',
          orderId: data.data?.order_id,
          orderCode: data.data?.order_code,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        // Add to active notifications list
        setNotifications(prev => [newNotification, ...prev])

        // Auto remove after 8 seconds
        setTimeout(() => {
          removeNotification(newNotification.id)
        }, 8000)
      } catch (err) {
        console.error('[WebSocket] Error parsing message:', err)
      }
    }

    socket.onclose = (e) => {
      console.log('[WebSocket] Connection closed:', e.reason)
    }

    socket.onerror = (err) => {
      console.error('[WebSocket] Connection error:', err)
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [user])

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => {
        const isSuccess = notif.type === 'payment_success'
        const isShipped = notif.type === 'order_shipped'

        return (
          <div
            key={notif.id}
            className="w-full bg-white/95 backdrop-blur-md border border-slate-200/65 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.12)] rounded-2xl p-4 flex gap-3.5 items-start pointer-events-auto transition-all duration-300 animate-slide-in relative overflow-hidden group"
          >
            {/* Top decorative gradient bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
              isSuccess 
                ? 'from-emerald-500 to-teal-400' 
                : isShipped 
                  ? 'from-blue-600 to-indigo-500' 
                  : 'from-amber-500 to-orange-400'
            }`} />

            {/* Icon container with background styling */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-1 ${
              isSuccess 
                ? 'bg-emerald-50 text-emerald-600' 
                : isShipped 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'bg-amber-50 text-amber-600'
            }`}>
              {isSuccess ? (
                <CheckCircle2 size={20} className="animate-pulse" />
              ) : isShipped ? (
                <Truck size={20} className="animate-bounce" />
              ) : (
                <Bell size={20} />
              )}
            </div>

            {/* Content text */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isSuccess ? 'Thanh toán' : isShipped ? 'Vận chuyển' : 'Thông báo'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {notif.timestamp}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 leading-tight">
                {isSuccess ? 'Thanh Toán Thành Công' : isShipped ? 'Đang Giao Hàng' : 'Cập Nhật Đơn Hàng'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {notif.message}
              </p>

              {/* Action Link for Order */}
              {notif.orderCode && (
                <a
                  href={`/profile?tab=orders&order=${notif.orderCode}`}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold mt-2.5 transition-colors ${
                    isSuccess 
                      ? 'text-emerald-600 hover:text-emerald-700' 
                      : isShipped 
                        ? 'text-blue-600 hover:text-blue-700' 
                        : 'text-indigo-600 hover:text-indigo-700'
                  }`}
                >
                  Xem chi tiết đơn hàng
                  <ExternalLink size={10} />
                </a>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => removeNotification(notif.id)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100/50 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
