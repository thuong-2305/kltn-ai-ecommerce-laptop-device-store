import { useId } from 'react'

function ShieldIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2l7 4v6c0 5-3 9-7 10C8 21 5 17 5 12V6l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function HeadsetIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 12a8 8 0 0 1 16 0" />
      <path d="M4 12v5a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2z" />
      <path d="M20 12v5a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2z" />
      <path d="M10 20h4" />
    </svg>
  )
}

function SlidersIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 21v-7" />
      <path d="M4 10V3" />
      <path d="M12 21V12" />
      <path d="M12 8V3" />
      <path d="M20 21v-5" />
      <path d="M20 12V3" />
      <path d="M2 14h4" />
      <path d="M10 10h4" />
      <path d="M18 16h4" />
    </svg>
  )
}

function RefreshIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  )
}

function ArrowRightIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 12h12" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

function GridPattern({ className = '' }) {
  const patternId = useId()

  return (
    <svg className={className} aria-hidden="true">
      <defs>
        <pattern id={patternId} width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M36 0H0V36" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}

function TechLines({ className = '' }) {
  return (
    <svg viewBox="0 0 600 360" className={className} aria-hidden="true">
      <path
        d="M-40 70C80 20 140 20 260 70s180 50 340 0 240-50 320 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.45"
      />
      <path
        d="M-30 250c120-40 190-40 310 0s190 40 320 0 220-40 310 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.35"
      />
      <path
        d="M80 40v36m0 208v36M520 110v36m0 128v36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.35"
      />
      <path
        d="M140 128h42m236 0h42M176 196h42m172 0h42"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.28"
      />
    </svg>
  )
}

function LaptopIllustration({ className = '' }) {
  const gradientId = useId()

  return (
    <svg
      viewBox="0 0 420 260"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="70" y1="40" x2="350" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" stopOpacity="0.7" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <rect
        x="75"
        y="28"
        width="270"
        height="172"
        rx="18"
        stroke="currentColor"
        strokeOpacity="0.9"
        strokeWidth="2"
      />
      <rect x="92" y="44" width="236" height="140" rx="14" fill={`url(#${gradientId})`} />

      <path
        d="M40 214h340l18 18c2 2 1 6-2 6H24c-3 0-4-4-2-6l18-18z"
        stroke="currentColor"
        strokeOpacity="0.85"
        strokeWidth="2"
      />
      <path d="M150 224h120" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2" />

      <circle cx="132" cy="74" r="3" fill="currentColor" fillOpacity="0.8" />
      <circle cx="290" cy="154" r="2" fill="currentColor" fillOpacity="0.6" />
      <circle cx="250" cy="90" r="2" fill="currentColor" fillOpacity="0.45" />
    </svg>
  )
}

function HomeSupportBanners() {
  const features = [
    {
      title: 'Bảo hành chính hãng',
      description: 'Chính sách rõ ràng, linh hoạt.',
      icon: ShieldIcon,
    },
    {
      title: 'Hỗ trợ kỹ thuật 24/7',
      description: 'Hướng dẫn tận tâm, nhanh gọn.',
      icon: HeadsetIcon,
    },
    {
      title: 'Build PC theo nhu cầu',
      description: 'Tối ưu hiệu năng theo ngân sách.',
      icon: SlidersIcon,
    },
    {
      title: 'Đổi trả dễ dàng',
      description: 'Thủ tục đơn giản, minh bạch.',
      icon: RefreshIcon,
    },
  ]

  return (
    <section
      className="mx-4.5 mb-8 relative overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.46),rgba(248,250,252,0.78))] shadow-standard border border-slate-200/50"
      id="guide"
    > 
      <div className="relative grid gap-6 p-6 md:p-8 lg:p-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-10">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <p className="text-label text-slate-500">
              <span className="h-2.25 w-2.25 rounded-full bg-brand-primary/80" aria-hidden="true" />
              Dịch vụ & hỗ trợ
            </p>

            <h1 className="m-0 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Premium support cho gamer & creator
            </h1>

            <p className="max-w-xl m-0 text-body-lg text-slate-600">
              Clean như Apple Store, mạnh mẽ như gaming store: tư vấn cấu hình chuẩn nhu cầu, tối ưu hiệu năng và trải nghiệm mua sắm an tâm.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <div
                  key={feature.title}
                  className="group flex items-start gap-3 rounded-2xl bg-white/70 p-3 shadow-light ring-1 ring-border-default/70 backdrop-blur-sm transition-all duration-standard hover:-translate-y-0.5 hover:shadow-standard hover:ring-brand-primary/20"
                >
                  <span className="grid w-10 h-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-brand-primary/10 to-brand-accent/10 text-brand-primary">
                    <Icon className="w-5 h-5" />
                  </span>

                  <div className="flex flex-col gap-0.5">
                    <p className="m-0 font-semibold text-subtitle-lg text-slate-900">{feature.title}</p>
                    <p className="m-0 text-body-sm text-slate-600">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:gap-4">        
            <p className="m-0 text-caption-lg text-slate-500">
              Miễn phí tư vấn, phản hồi nhanh trong vài phút.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 shadow-dark ring-1 ring-white/10">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute rounded-full -right-20 -top-14 h-80 w-80 bg-brand-primary/25 blur-3xl" />
              <div className="absolute rounded-full -left-20 -bottom-18 h-80 w-80 bg-brand-accent/20 blur-3xl" />
              <GridPattern className="absolute inset-0 w-full h-full opacity-50 text-white/10" />
              <TechLines className="absolute inset-0 w-full h-full text-brand-primary/25 opacity-70" />
            </div>

            <div className="relative flex flex-col items-center gap-6 px-5 py-8">
              <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-caption-sm font-semibold text-white/90 backdrop-blur-sm ring-1 ring-white/15">
                <ShieldIcon className="w-4 h-4" />
                Official warranty
              </div>

              <LaptopIllustration className="w-full max-w-sm h-48 text-white/90" />

              <div className="grid w-full max-w-sm grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white/8 ring-1 ring-white/10 backdrop-blur-sm">
                  <p className="m-0 font-semibold text-caption-sm text-white/90">24/7 Support</p>
                  <p className="m-0 text-caption-lg text-white/70">Kỹ thuật & bảo hành</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/8 ring-1 ring-white/10 backdrop-blur-sm">
                  <p className="m-0 font-semibold text-caption-sm text-white/90">Build Ready</p>
                  <p className="m-0 text-caption-lg text-white/70">Gợi ý cấu hình</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute w-64 h-16 -translate-x-1/2 rounded-full pointer-events-none -bottom-7 left-1/2 bg-brand-primary/20 blur-3xl" />
        </div>
      </div>
    </section>
  )
}

export default HomeSupportBanners