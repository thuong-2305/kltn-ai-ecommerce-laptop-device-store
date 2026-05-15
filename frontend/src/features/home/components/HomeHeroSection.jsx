import { SEMANTIC_CLASSES, COLOR_ACCENTS } from '../../../constants/designSystem'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

function HomeHeroSection({
  categories = [],
  currentHero,
  heroSlides = [],
  activeHeroIndex = 0,
  onPrev,
  onNext,
  onSelectSlide,
  featuredProductCount = 0,
}) {
  const slide = currentHero ?? heroSlides[activeHeroIndex] ?? heroSlides[0] ?? {}
  const backgroundClasses = [
    "bg-[url('/hero/slide-1.png')]",
    "bg-[url('/hero/slide-2.png')]",
    "bg-[url('/hero/slide-3.png')]",
  ]
  const heroBackgroundClass = backgroundClasses[activeHeroIndex] ?? backgroundClasses[0]

  const navButtonBaseClass = `absolute z-10 ${SEMANTIC_CLASSES.LAYOUT.GRID_CENTER} h-10 w-10 -translate-y-1/2 rounded-full border ${SEMANTIC_CLASSES.TEXT.SECONDARY} shadow-[0_14px_30px_rgba(15,23,42,0.18)]`
  const heroArticleClass = `relative grid min-h-117 grid-cols-1 items-center gap-4 overflow-hidden rounded-3xl px-8 py-8 text-white shadow-[0_18px_44px_rgba(15,23,42,0.18)] lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:gap-4.5 lg:px-8.5 lg:py-8.5 ${heroBackgroundClass} bg-slate-900 bg-cover bg-center bg-no-repeat`

  return (
    <section className={`mx-4.5 mb-4 grid gap-0 overflow-hidden rounded-none border ${SEMANTIC_CLASSES.BORDER.DEFAULT} bg-white/90 lg:grid-cols-[240px_minmax(0,1fr)]`} id="hero">
      <aside className={`border-md ${SEMANTIC_CLASSES.BORDER.DEFAULT} bg-linear-to-b from-white/60 to-slate-50/80 px-4.5 py-5.5 lg:border-b-0 lg:border-r`}>
        <div className="flex flex-col gap-2">
          {categories.slice(0, 8).map((category) => (
            <a key={category.id} href={`#category-${category.id}`} className={`${SEMANTIC_CLASSES.LAYOUT.FLEX_CENTER} min-h-13.5 justify-start gap-3 rounded-2xl px-2.5 py-2 transition hover:-translate-x-1 hover:bg-blue-50 hover:shadow-[0_10px_22px_rgba(15,23,42,0.05)]`}>
              <span className={`${SEMANTIC_CLASSES.LAYOUT.GRID_CENTER} h-9 w-9 shrink-0 overflow-hidden rounded-[14px] ${COLOR_ACCENTS.GRADIENT_ICON_BG} text-blue-600`}>
                {category.image ? <img src={category.image} alt={category.name} className="object-cover w-full h-full" /> : (category.name?.[0] ?? '?')}
              </span>
              <span className="flex flex-col gap-0.5">
                <p className={`text-subtitle font-semibold ${SEMANTIC_CLASSES.TEXT.PRIMARY}`}>{category.name}</p>
              </span>
            </a>
          ))}

          {categories.length === 0 && (
            <p className={`text-sm ${SEMANTIC_CLASSES.TEXT.MUTED}`}>Chưa có danh mục nào được tạo trong cơ sở dữ liệu.</p>
          )}
        </div>
      </aside>

      <div className={`relative min-h-125 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.46),rgba(248,250,252,0.78))] p-4`}>
        <button
          type="button"
          className={`${navButtonBaseClass} left-4 top-1/2`}
          onClick={onPrev}
          aria-label="Slide trước"
        >
          <FiChevronLeft size={22} aria-hidden="true" className='text-white'/>
        </button>

        <article className={heroArticleClass}>
          <div className="relative z-1" />

          <div className="absolute flex flex-wrap gap-3 bottom-20 left-10 z-1">
            <button
              type="button"
              className={`h-12 bg-linear-to-r ${COLOR_ACCENTS.BLUE_DARK} px-4.5 font-bold text-white`}
              aria-label={`Khám phá ngay${slide?.title ? `: ${slide.title}` : ''}`}
            >
              Khám phá ngay
            </button>
          </div>
        </article>

        <button
          type="button"
          className={`${navButtonBaseClass} right-4 top-1/2`}
          onClick={onNext}
          aria-label="Slide tiếp theo"
        >
          <FiChevronRight size={22} aria-hidden="true" className='text-white'/>
        </button>

        <div className="flex justify-center gap-2 mt-4" aria-label="Điều hướng slide">
          {heroSlides.map((heroSlide, index) => (
            <button
              key={`${heroSlide.title}-${heroSlide.accent}`}
              type="button"
              className={index === activeHeroIndex ? 'h-2.25 w-7 rounded-full bg-linear-to-r from-blue-600 to-cyan-500' : 'h-2.25 w-2.25 rounded-full bg-blue-200'}
              onClick={() => onSelectSlide(index)}
              aria-label={`Chọn slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomeHeroSection