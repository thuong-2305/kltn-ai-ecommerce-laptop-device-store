import { SEMANTIC_CLASSES } from '../../../constants/designSystem'

/**
 * NewsArticleCard - Reusable article card component
 * Features: Image preview, date, title, excerpt, hover effects
 */
function NewsArticleCard({ article }) {
  return (
    <article className="group flex flex-col h-full rounded-2xl border border-slate-200/80 bg-white/80 shadow-light ring-0 transition-all duration-300 hover:border-slate-300 hover:shadow-standard hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative w-full h-48 overflow-hidden rounded-t-xl bg-slate-50">
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-50" />
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col gap-3 flex-1 p-4">
        {/* Date */}
        {article.date && (
          <p className="text-caption-sm text-slate-500 font-medium">
            {article.date}
          </p>
        )}

        {/* Title */}
        <h3 className="text-subtitle-lg font-semibold text-slate-900 line-clamp-2 leading-snug">
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-body-sm text-slate-600 line-clamp-2 flex-1 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Read More Link */}
        <a
          href={article.link || '#news'}
          className="inline-flex items-center gap-1.5 text-caption-lg font-semibold text-blue-600 transition-colors hover:text-blue-700 active:text-blue-800 mt-auto"
          aria-label={`Đọc bài viết: ${article.title}`}
        >
          Xem thêm
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>
  )
}

/**
 * HomeNewsSection - Main news/tech articles section
 * Layout: Responsive grid (3 desktop, 2 tablet, 1 mobile)
 */
function HomeNewsSection({ newsCards = [] }) {
  return (
    <section className="mx-4.5 mb-8" id="news" aria-label="Tin tức công nghệ">
      {/* Header Section */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-2">
            {/* Label */}
            <p className="inline-flex items-center gap-2 m-0 text-label text-slate-500">
              <span className="h-2.25 w-2.25 rounded-full bg-blue-600/80" aria-hidden="true" />
              Tin tức công nghệ
            </p>

            {/* Title */}
            <h1 className="text-3xl font-extrabold text-title text-slate-900">
              Đọc nhanh trước khi mua
            </h1>
          </div>

          {/* CTA Button */}
          <a
            href="#footer"
            className="inline-flex items-center gap-2 px-5 h-11 rounded-2xl border border-slate-200/80 bg-white/80 text-slate-900 font-semibold text-button shadow-light transition-all duration-300 hover:bg-white hover:border-slate-300 hover:shadow-standard hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 active:translate-y-0 whitespace-nowrap shrink-0"
          >
            Xem tất cả
            <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* News Grid */}
        {newsCards && newsCards.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {newsCards.slice(0, 6).map((article) => (
              <NewsArticleCard
                key={article.title || article.id}
                article={article}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 rounded-2xl border border-slate-200/50 bg-slate-50/50">
            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2v-5.5a2 2 0 012-2H7m2 0a2 2 0 00-2 2v5.5a2 2 0 002 2h10a2 2 0 002-2v-5.5a2 2 0 00-2-2m0 0H9m4 0H5m0 0v5.5A2 2 0 007 20h10a2 2 0 002-2v-5.5" />
            </svg>
            <p className="text-body-sm text-slate-500 text-center">
              Chưa có bài viết nào. Hãy quay lại sau!
            </p>
          </div>
        )}
    </section>
  )
}

export default HomeNewsSection