/**
 * ProductListLoadingState - Loading skeleton screen
 */
function ProductListLoadingState() {
  return (
    <div className="space-y-8">
      {/* Header Loading */}
      <div className="space-y-3">
        <div className="h-10 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="h-6 bg-slate-200 rounded w-96 animate-pulse" />
      </div>

      {/* Grid Loading */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/50 bg-white/50 overflow-hidden h-80 animate-pulse"
          >
            <div className="w-full h-56 bg-slate-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-24" />
              <div className="h-5 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-20" />
              <div className="h-10 bg-slate-200 rounded w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductListLoadingState
