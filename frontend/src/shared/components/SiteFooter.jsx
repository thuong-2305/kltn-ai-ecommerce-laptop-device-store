import { Link } from 'react-router-dom'

/* ─── Custom SVG Social Icons (Lightweight & responsive) ─── */
function FacebookIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.71.054 1.14.051 1.96.23 2.53.45a5.58 5.58 0 011.66 1.08c.42.36.81.74 1.08 1.17.23.53.4.1.45 1.15.04.93.05 1.28.05 3.71l-.003.002v3.71c0 2.43-.01 2.78-.054 3.71-.051 1.14-.23 1.96-.45 2.53a5.58 5.58 0 01-1.08 1.66c-.36.42-.74.81-1.17 1.08-.53.23-1.01.4-2.53.45-.93.04-1.28.05-3.71.05s-2.78-.01-3.71-.05c-1.14-.051-1.96-.23-2.53-.45a5.58 5.58 0 01-1.66-1.08 5.58 5.58 0 01-1.08-1.17c-.23-.53-.4-1.01-.45-2.53C2.01 14.784 2 14.43 2 12c0-2.43.01-2.784.054-3.71.051-1.14.23-1.96.45-2.53a5.58 5.58 0 011.08-1.66A5.58 5.58 0 015.45 2.89c.53-.23 1.01-.4 2.53-.45.93-.04 1.28-.05 3.71-.05zm0 2.43c-2.4 0-2.71.01-3.66.054-.92.04-1.42.19-1.75.32-.44.17-.75.37-1.08.7-.33.33-.53.64-.7 1.08-.13.33-.28.83-.32 1.75C5.01 9.29 5 9.6 5 12c0 2.4.01 2.71.054 3.66.04.92.19 1.42.32 1.75.17.44.37.75.7 1.08.33.33.64.53 1.08.7.33.13.83.28 1.75.32.95.04 1.26.05 3.66.05s2.71-.01 3.66-.05c.92-.04 1.42-.19 1.75-.32.44-.17.75-.37 1.08-.7.33-.33.53-.64.7-1.08.13-.33.28-.83.32-1.75.04-.95.05-1.26.05-3.66s-.01-2.71-.05-3.66c-.04-.92-.19-1.42-.32-1.75-.17-.44-.37-.75-.7-1.08-.33-.33-.64-.53-1.08-.7-.33-.13-.83-.28-1.75-.32-.95-.04-1.26-.05-3.66-.05zm0 2.44a5.13 5.13 0 100 10.26 5.13 5.13 0 000-10.26zm0 2.43a2.7 2.7 0 110 5.4 2.7 2.7 0 010-5.4zm6.4-3.61a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" clipRule="evenodd" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.67 22 12 22 12s0 3.33-.42 4.814a2.5 2.5 0 01-1.768 1.768c-1.48.42-4.812.42-4.812.42s-3.333 0-4.815-.42a2.5 2.5 0 01-1.768-1.768C8.001 15.33 8 12 8 12s0-3.33.42-4.814a2.5 2.5 0 011.768-1.768c1.482-.42 4.815-.42 4.815-.42s3.33 0 4.815.42zM12 9.5v5l4.5-2.5-4.5-2.5z" clipRule="evenodd" />
    </svg>
  )
}

function TiktokIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95.82 2.11 1.34 3.33 1.52.01 1.29.02 2.58.01 3.87-1.57-.14-3.07-.79-4.22-1.88v6.23c.09 1.83-.55 3.65-1.73 4.97-1.47 1.48-3.62 2.19-5.67 1.82-2.31-.3-4.27-2.02-4.83-4.29-.68-2.43.3-5.06 2.37-6.28 1.31-.79 2.92-.93 4.35-.41v3.91c-.88-.41-1.92-.25-2.63.41-.69.61-1 1.57-.8 2.47.22.95 1.1 1.63 2.08 1.61 1.13.04 2.11-.8 2.23-1.92.01-.13.01-.26.01-.39V0h.01z" />
    </svg>
  )
}

function SiteFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 px-4.5 py-12 lg:py-16 text-white" id="footer" aria-label="Chân trang">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] gap-8 md:gap-10">
        
        {/* Column 1: Brand & Socials */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex flex-col gap-0.5 leading-none hover:opacity-90 transition-opacity w-fit">
            <div className="text-xl font-black tracking-tight text-white sm:text-2xl">
              <span>LAPTOP</span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">DEVICE</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Công nghệ cho cuộc sống</span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            LaptopDevice là hệ thống bán lẻ máy tính xách tay và linh kiện thiết bị công nghệ chính hãng hàng đầu, mang đến dịch vụ tận tâm và trải nghiệm mua sắm an tâm tuyệt đối.
          </p>
          
          {/* Social Media Row */}
          <div className="flex items-center gap-3 mt-2">
            {[
              { icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com' },
              { icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com' },
              { icon: YoutubeIcon, label: 'Youtube', href: 'https://youtube.com' },
              { icon: TiktokIcon, label: 'Tiktok', href: 'https://tiktok.com' }
            ].map(social => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Theo dõi LaptopDevice trên ${social.label}`}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all duration-300 shadow-sm"
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-slate-200 text-xs font-black uppercase tracking-wider mb-1">Về chúng tôi</h4>
          <nav className="flex flex-col gap-2">
            {[
              { label: 'Giới thiệu công ty', href: '/about' },
              { label: 'Tuyển dụng nhân sự', href: '#featured' },
              { label: 'Tin tức công nghệ', href: '/blog' },
              { label: 'Liên hệ hỗ trợ', href: '/contact' }
            ].map(link => (
              <Link
                key={link.label}
                to={link.href}
                className="text-slate-400 hover:text-blue-500 hover:translate-x-0.5 transition-all duration-200 text-sm py-0.5 block w-fit"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Column 3: Policies */}
        <div className="flex flex-col gap-4">
          <h4 className="text-slate-200 text-xs font-black uppercase tracking-wider mb-1">Chính sách hỗ trợ</h4>
          <nav className="flex flex-col gap-2">
            {[
              { label: 'Chính sách bảo hành', href: '/warranty-policy' },
              { label: 'Chính sách đổi trả', href: '/return-policy' },
              { label: 'Chính sách vận chuyển', href: '/shipping-policy' },
              { label: 'Bảo mật thông tin', href: '/privacy-policy' }
            ].map(link => (
              <Link
                key={link.label}
                to={link.href}
                className="text-slate-400 hover:text-blue-500 hover:translate-x-0.5 transition-all duration-200 text-sm py-0.5 block w-fit"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Column 4: Newsletter */}
        <div className="flex flex-col gap-4">
          <h4 className="text-slate-200 text-xs font-black uppercase tracking-wider mb-1">Đăng ký nhận tin</h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            Nhập email của bạn để nhận thông tin khuyến mãi và các đợt flash sale công nghệ sớm nhất từ LaptopDevice.
          </p>
          <form onSubmit={e => e.preventDefault()} className="flex gap-2 mt-1">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              aria-label="Địa chỉ email đăng ký"
              className="flex-1 h-11 px-4 rounded-xl border border-slate-800 bg-slate-900/50 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all min-w-0"
              required
            />
            <button
              type="submit"
              className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-glow hover:shadow-button-hover active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              Đăng ký
            </button>
          </form>
        </div>

      </div>

      {/* Footer Bottom Row */}
      <div className="border-t border-slate-900 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <span className="font-medium text-center md:text-left">
          © {new Date().getFullYear()} LaptopDevice. All rights reserved.
        </span>
        
        {/* Payment badging representations */}
        <div className="flex items-center gap-2 flex-wrap" aria-label="Phương thức thanh toán chấp nhận">
          {['VISA', 'Mastercard', 'MoMo', 'ZaloPay'].map(badge => (
            <span
              key={badge}
              className="px-3 py-1 text-[10px] font-black tracking-widest text-slate-400 border border-slate-900 rounded-lg bg-slate-950/60 shadow-inner select-none"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter