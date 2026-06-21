function HomeBrandStrip() {
  const brands = [
    { name: 'ASUS', logo: '/logo/logo-asus.jpg' },
    { name: 'Acer', logo: '/logo/logo-acer.jpg' },
    { name: 'Dell', logo: '/logo/Dell-Logo.png' },
    { name: 'HP', logo: '/logo/logo-hp.png' },
    { name: 'Apple', logo: '/logo/logo-apple.png' }
  ]

  return (
    <section className="mx-4.5 mb-8" aria-label="Thương hiệu nổi bật">
      <div className="bg-transparent border-none rounded-none shadow-none section-block__head section-block__head--compact p-0">
        <div>
          <p className="text-label text-slate-500">Thương hiệu nổi bật</p>
          <h2 className="text-3xl font-extrabold text-title text-slate-900">Chọn theo hãng bạn tin dùng</h2>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 brand-grid sm:grid-cols-4 sm:gap-4 lg:grid-cols-8">
        {brands.map((brand) => (
          <div
            key={brand.name}
            className="brand-chip cursor-pointer transition-all duration-standard hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-standard hover:ring-1 hover:ring-brand-primary/15"
          >
            <img
              src={brand.logo}
              alt={`${brand.name} logo`}
              className="object-contain w-full h-16"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default HomeBrandStrip