export default function RouteSpinner() {
  return (
    <div className="flex-1 min-h-[400px] w-full flex flex-col items-center justify-center bg-slate-50/50">
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
        {/* Pulse inner point */}
        <div className="absolute h-3 w-3 rounded-full bg-blue-600 animate-ping"></div>
      </div>
      <span className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Đang tải trang...</span>
    </div>
  )
}
