import { formatPercent, truncateText } from '../../../shared/utils/formatters'

export const EMPTY_ARRAY = []

export const DEFAULT_STATS = {
  category_count: 0,
  active_sale_count: 0,
  featured_product_count: 0,
  top_product_count: 0,
}

function buildFallbackText(title, subtitle) {
  return {
    eyebrow: title,
    title: subtitle,
    description: 'Khám phá bộ sưu tập sản phẩm mới, giá tốt và ưu đãi nổi bật ngay hôm nay.',
  }
}

export function buildHomeViewModel(homeData) {
  const safeData = homeData ?? {}
  const categories = safeData.categories ?? EMPTY_ARRAY
  const activeSales = safeData.active_sales ?? EMPTY_ARRAY
  const featuredProducts = safeData.featured_products ?? EMPTY_ARRAY
  const topProducts = safeData.top_products ?? EMPTY_ARRAY
  const stats = safeData.stats ?? DEFAULT_STATS

  const heroSlides = [
    {
      ...buildFallbackText('LAPTOP THẾ HỆ MỚI', 'Hiệu năng đỉnh cao'),
      cta: 'Mua ngay',
      accent: 'blue',
      image: featuredProducts[0]?.image || null,
      badge: activeSales[0]
        ? `Giảm đến ${formatPercent(activeSales[0].discount_percentage)}`
        : 'Mẫu laptop nổi bật',
      description: featuredProducts[0]?.short_description
        ? truncateText(featuredProducts[0].short_description, 130)
        : 'Khám phá những mẫu laptop nổi bật đang có trong hệ thống.',
    },
    {
      ...buildFallbackText('GAMING GEAR', 'Sẵn sàng cho mọi trận đấu'),
      cta: 'Xem ngay',
      accent: 'violet',
      image: topProducts[0]?.image || featuredProducts[1]?.image || null,
      badge: topProducts[0] ? 'Bán chạy nhất' : 'Lựa chọn gamer',
      description: topProducts[0]?.short_description
        ? truncateText(topProducts[0].short_description, 130)
        : 'Bộ sưu tập gear tối ưu cho làm việc và giải trí.',
    },
    {
      ...buildFallbackText('PHỤ KIỆN CHÍNH HÃNG', 'Hoàn thiện góc làm việc'),
      cta: 'Khám phá',
      accent: 'orange',
      image: featuredProducts[2]?.image || categories[0]?.image || null,
      badge: activeSales[1]
        ? `Ưu đãi ${formatPercent(activeSales[1].discount_percentage)}`
        : 'Phụ kiện tiện ích',
      description: categories[0]
        ? `Danh mục ${categories[0].name} và các sản phẩm đi kèm đang sẵn sàng cho bạn.`
        : 'Phụ kiện, chuột, bàn phím và nhiều món đồ công nghệ thiết yếu.',
    },
  ]

  const productTabs = [
    { id: 'all', label: 'Tất cả' },
    ...categories.slice(0, 4).map((category) => ({
      id: String(category.id),
      label: category.name,
    })),
  ]

  const promoCards = [
    {
      title: 'MacBook Air M3',
      subtitle: 'Siêu mỏng nhẹ, tối ưu cho sáng tạo',
      price: 'Từ 24.990.000đ',
      action: 'Xem ngay',
      image: featuredProducts[0]?.image || null,
      tone: 'lavender',
    },
    {
      title: 'Gaming Gear',
      subtitle: 'Bộ sưu tập dành cho game thủ',
      price: 'Giảm đến 15%',
      action: 'Khám phá',
      image: topProducts[0]?.image || null,
      tone: 'mint',
    },
    {
      title: 'Phụ kiện chính hãng',
      subtitle: 'Chất lượng cao, giá tốt mỗi ngày',
      price: 'Giảm đến 30%',
      action: 'Mua ngay',
      image: categories[0]?.image || null,
      tone: 'peach',
    },
  ]

  const newsCards = [
    {
      title: '5 lý do nên nâng cấp laptop trong năm nay',
      date: '20/05/2024',
      excerpt: 'Hiệu năng mới, pin lâu hơn và trải nghiệm mượt hơn cho công việc lẫn giải trí.',
      image: featuredProducts[0]?.image || null,
    },
    {
      title: 'Hướng dẫn chọn laptop phù hợp nhu cầu',
      date: '18/05/2024',
      excerpt: 'Từ học tập, văn phòng đến đồ họa và gaming, chọn đúng cấu hình để tối ưu chi phí.',
      image: featuredProducts[1]?.image || featuredProducts[0]?.image || null,
    },
    {
      title: 'Xu hướng công nghệ đáng chú ý năm 2024',
      date: '16/05/2024',
      excerpt: 'Các thiết bị mỏng nhẹ, AI tích hợp và màn hình tần số quét cao tiếp tục lên ngôi.',
      image: topProducts[0]?.image || categories[0]?.image || null,
    },
  ]

  return {
    categories,
    activeSales,
    featuredProducts,
    topProducts,
    stats,
    heroSlides,
    productTabs,
    promoCards,
    newsCards,
  }
}