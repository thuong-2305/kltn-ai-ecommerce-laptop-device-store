import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, User, ArrowRight, Clock, ChevronRight, Tag } from 'lucide-react'

const CATEGORIES = ['Tất cả', 'Đánh giá sản phẩm', 'Tin tức công nghệ', 'Thủ thuật', 'Sự kiện']

const FEATURED_POST = {
  id: 1,
  title: 'Apple ra mắt MacBook Pro M4: Sức mạnh vượt trội, thiết kế mỏng nhẹ hơn bao giờ hết',
  excerpt: 'Thế hệ MacBook Pro mới nhất được trang bị chip M4 series mạnh mẽ, màn hình OLED siêu sáng và thời lượng pin lên đến 22 giờ. Đây hứa hẹn sẽ là bản nâng cấp đáng giá nhất trong 3 năm qua.',
  category: 'Tin tức công nghệ',
  date: '20 Tháng 5, 2026',
  author: 'Trần Tech',
  image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200&h=600',
  readTime: '5 phút đọc'
}

const POSTS = [
  {
    id: 2,
    title: 'Top 5 Laptop Gaming cấu hình khủng đáng mua nhất mùa tựu trường 2026',
    excerpt: 'Tổng hợp danh sách các cỗ máy chiến game sở hữu RTX 4070, màn hình 240Hz với mức giá vô cùng hấp dẫn dành cho học sinh sinh viên.',
    category: 'Đánh giá sản phẩm',
    date: '18 Tháng 5, 2026',
    author: 'Minh Reviewer',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600&h=400',
    readTime: '8 phút đọc'
  },
  {
    id: 3,
    title: 'Hướng dẫn tối ưu hóa Windows 11 để chơi game mượt mà hơn 30%',
    excerpt: 'Chỉ với 5 bước đơn giản tắt các dịch vụ chạy ngầm và tùy chỉnh Registry, bạn có thể tăng đáng kể FPS trong các tựa game eSport.',
    category: 'Thủ thuật',
    date: '15 Tháng 5, 2026',
    author: 'Admin Support',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600&h=400',
    readTime: '6 phút đọc'
  },
  {
    id: 4,
    title: 'Đánh giá chi tiết bàn phím cơ Keychron Q1 Pro: Hoàn hảo cho dân văn phòng?',
    excerpt: 'Keychron Q1 Pro mang lại cảm giác gõ êm ái nhờ thiết kế gasket mount và bộ keycap KSA độc quyền, đi kèm kết nối không dây tiện lợi.',
    category: 'Đánh giá sản phẩm',
    date: '12 Tháng 5, 2026',
    author: 'Hải Keyboard',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=600&h=400',
    readTime: '10 phút đọc'
  },
  {
    id: 5,
    title: 'Sự kiện ra mắt sản phẩm mới của Asus: Cỗ máy ROG Mothership tiếp theo?',
    excerpt: 'Asus vừa gửi thư mời sự kiện ra mắt dải sản phẩm ROG năm 2026. Cùng dự đoán xem "quái thú" nào sẽ xuất hiện.',
    category: 'Sự kiện',
    date: '10 Tháng 5, 2026',
    author: 'Trần Tech',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=600&h=400',
    readTime: '4 phút đọc'
  },
  {
    id: 6,
    title: 'Cách chọn mua màn hình rời cho MacBook để làm đồ họa chuẩn màu',
    excerpt: 'Đâu là những tiêu chí quan trọng nhất khi chọn màn hình (Độ phân giải, dải màu DCI-P3, cổng Type-C PD) để làm việc với Mac?',
    category: 'Thủ thuật',
    date: '08 Tháng 5, 2026',
    author: 'Minh Reviewer',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=600&h=400',
    readTime: '7 phút đọc'
  },
  {
    id: 7,
    title: 'Intel Core Ultra thế hệ thứ 2 chính thức ra mắt, đe dọa trực tiếp AMD',
    excerpt: 'Vi xử lý mới từ Intel mang lại khả năng tiết kiệm điện đột phá và hiệu năng NPU xử lý AI tăng gấp 3 lần.',
    category: 'Tin tức công nghệ',
    date: '05 Tháng 5, 2026',
    author: 'Tin nhanh',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600&h=400',
    readTime: '5 phút đọc'
  }
]

export default function BlogListPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả')

  const filteredPosts = activeCategory === 'Tất cả' 
    ? POSTS 
    : POSTS.filter(p => p.category === activeCategory)

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-4.5 py-6 pb-16">
        
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm">
          <Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Trang chủ</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-900 font-semibold">Tin tức & TechZone Blog</span>
        </nav>
        
        {/* Header & Categories */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">TechZone <span className="text-blue-600">Blog</span></h1>
          <p className="text-slate-500 text-base mb-8">Cập nhật những tin tức công nghệ mới nhất, đánh giá chuyên sâu và thủ thuật hữu ích dành cho tín đồ yêu công nghệ.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post (Only show on 'Tất cả') */}
        {activeCategory === 'Tất cả' && (
          <div className="mb-12 group cursor-pointer">
            <Link to={`/blog/${FEATURED_POST.id}`} className="block relative rounded-3xl overflow-hidden bg-slate-900 aspect-[21/9] md:aspect-[24/9]">
              <img src={FEATURED_POST.image} alt={FEATURED_POST.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold mb-4">
                  <Tag size={12} /> {FEATURED_POST.category}
                </span>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight group-hover:text-blue-300 transition-colors">{FEATURED_POST.title}</h2>
                <p className="text-slate-300 text-sm md:text-base max-w-3xl mb-6 line-clamp-2 md:line-clamp-none">{FEATURED_POST.excerpt}</p>
                
                <div className="flex items-center gap-6 text-slate-400 text-sm font-medium">
                  <div className="flex items-center gap-2"><User size={16} /> {FEATURED_POST.author}</div>
                  <div className="flex items-center gap-2"><Calendar size={16} /> {FEATURED_POST.date}</div>
                  <div className="flex items-center gap-2"><Clock size={16} /> {FEATURED_POST.readTime}</div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <Link key={post.id} to={`/blog/${post.id}`} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-4 left-4 inline-flex px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-black uppercase tracking-wider shadow-sm">
                  {post.category}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h3>
                <p className="text-slate-500 text-sm mb-5 line-clamp-3 flex-1">{post.excerpt}</p>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
                  <span className="flex items-center gap-1 text-blue-600 font-bold group-hover:translate-x-1 transition-transform">Đọc tiếp <ArrowRight size={14} /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state if filtered category has no posts */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có bài viết nào</h3>
            <p className="text-slate-500">Danh mục này hiện chưa có bài viết. Vui lòng quay lại sau.</p>
          </div>
        )}

        {/* Load More */}
        {filteredPosts.length > 0 && (
          <div className="mt-12 text-center">
            <button className="px-8 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:border-blue-600 hover:text-blue-600 transition-colors">
              Xem thêm bài viết
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
