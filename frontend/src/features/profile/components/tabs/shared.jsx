import { CheckCircle2, AlertCircle } from 'lucide-react'

export function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/80">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
        <Icon size={17} className="text-white" />
      </div>
      <div>
        <h2 className="font-black text-slate-900 text-base">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

export function Toast({ msg, type }) {
  if (!msg) return null
  const isSuccess = type === 'success'
  return (
    <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold mb-5 border ${
      isSuccess
        ? 'bg-green-50 border-green-200 text-green-700'
        : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      {isSuccess ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
      {msg}
    </div>
  )
}

export function Field({ label, icon: Icon, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
      <div className={`relative flex items-center rounded-xl border bg-white transition-all ${
        error
          ? 'border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
          : 'border-slate-200 focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]'
      }`}>
        {Icon && <span className="absolute left-3.5 text-slate-400 pointer-events-none"><Icon size={15} /></span>}
        {children}
      </div>
      {error && <p className="flex items-center gap-1 text-xs text-red-600 font-medium"><AlertCircle size={11} />{error}</p>}
    </div>
  )
}

export const inputCls = (hasIcon = true, extra = '') =>
  `w-full h-11 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none ${hasIcon ? 'pl-10 pr-4' : 'px-4'} ${extra}`
