import { SEMANTIC_CLASSES } from "../../../constants/designSystem"

function HomePromoGrid({ categories = [] }) {
  if (!categories?.length) {
    return null
  }

  return (
    <section className="mx-4.5" id="promotions" aria-label="Danh mục nổi bật">
      <div className="flex justify-between snap-x snap-mandatory gap-3.5 overflow-x-auto px-1 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.slice(0, 8).map((category) => (
          <a
            key={category.id ?? category.name}
            className={`flex min-w-32 flex-none snap-start flex-col items-center justify-center gap-2.5 rounded-md border ${SEMANTIC_CLASSES.BORDER.DEFAULT} bg-white/80 px-4.5 py-3.5 shadow-standard transition duration-200 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]`}
            href={category.id ? `#category-${category.id}` : '#featured'}
            aria-label={category.name}
          >
            <span className="grid overflow-hidden rounded-md h-13 w-13 place-items-center bg-slate-50/90" aria-hidden="true">
              {category.image ? (
                <img src={category.image} alt="" loading="lazy" className="object-contain w-full h-full" />
              ) : (
                <span className="font-extrabold text-slate-700">{category.name?.[0] ?? '?'}</span>
              )}
            </span>
            <span className="font-bold text-center text-button text-slate-900">{category.name}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

export default HomePromoGrid