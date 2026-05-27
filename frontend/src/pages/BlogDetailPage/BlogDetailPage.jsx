import { Link } from 'react-router-dom'
import { Calendar, User, Clock, ChevronRight, Tag, Share2, Mail, Link as LinkIcon, MessageSquare, ThumbsUp } from 'lucide-react'

const POST = {
  id: 1,
  title: 'Apple ra mắt MacBook Pro M4: Sức mạnh vượt trội, thiết kế mỏng nhẹ hơn bao giờ hết',
  category: 'Tin tức công nghệ',
  date: '20 Tháng 5, 2026',
  author: 'Trần Tech',
  readTime: '5 phút đọc',
  image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200&h=600',
  content: `
    <p class="lead text-xl text-slate-600 mb-6 font-medium leading-relaxed">Thế hệ MacBook Pro mới nhất được trang bị chip M4 series mạnh mẽ, màn hình OLED siêu sáng và thời lượng pin lên đến 22 giờ. Đây hứa hẹn sẽ là bản nâng cấp đáng giá nhất trong 3 năm qua.</p>
    
    <h2 class="text-2xl font-black text-slate-800 mt-10 mb-4">Sức mạnh từ con chip M4 Series</h2>
    <p class="mb-4">Apple đã chính thức công bố bộ vi xử lý M4 và M4 Pro, mang lại hiệu suất CPU tăng 30% và GPU tăng 40% so với thế hệ M3. Điều này giúp các tác vụ đồ họa, render video 8K và lập trình phức tạp diễn ra mượt mà chưa từng có.</p>
    <img src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80" class="w-full rounded-2xl my-8 shadow-sm" alt="MacBook M4 Chip" />
    
    <h2 class="text-2xl font-black text-slate-800 mt-10 mb-4">Màn hình OLED đầu tiên trên MacBook</h2>
    <p class="mb-4">Thay vì sử dụng Mini-LED, Apple đã chuyển sang tấm nền OLED cho MacBook Pro M4. Tấm nền này mang lại độ tương phản tuyệt đối, màu đen sâu thẳm và độ sáng peak lên đến 1600 nits. Viền màn hình cũng được làm mỏng hơn 20%.</p>
    
    <blockquote class="border-l-4 border-blue-600 bg-blue-50 p-6 rounded-r-2xl my-8 italic text-slate-700 font-medium">
      "Sự kết hợp giữa M4 và màn hình OLED biến MacBook Pro trở thành cỗ máy di động hoàn hảo nhất mà chúng tôi từng tạo ra." - Đại diện Apple chia sẻ.
    </blockquote>

    <h2 class="text-2xl font-black text-slate-800 mt-10 mb-4">Giá bán và ngày lên kệ</h2>
    <p class="mb-4">Dự kiến MacBook Pro M4 sẽ có mặt tại Việt Nam vào giữa tháng 6/2026. Mức giá khởi điểm cho phiên bản 14-inch M4 (16GB RAM / 512GB SSD) là <strong>39.990.000 VNĐ</strong>.</p>
  `,
  tags: ['Apple', 'MacBook', 'M4 Chip', 'Công nghệ'],
}

export default function BlogDetailPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-4.5 py-6 pb-16">
        <div className="max-w-[800px] mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-sm">
            <Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Trang chủ</Link>
            <ChevronRight size={14} className="text-slate-300" />
            <Link to="/blog" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Blog</Link>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-md">{POST.title}</span>
          </nav>

          <article className="mt-8 lg:mt-12">
        
        {/* Article Header */}
        <header className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider mb-4">
            <Tag size={12} /> {POST.category}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
            {POST.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200">
            <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><User size={16}/></div>
                <span className="font-bold text-slate-800">{POST.author}</span>
              </div>
              <div className="h-4 w-px bg-slate-300"></div>
              <div className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400"/> {POST.date}</div>
              <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
              <div className="items-center gap-1.5 hidden sm:flex"><Clock size={16} className="text-slate-400"/> {POST.readTime}</div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-colors"><LinkIcon size={16} /></button>
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-400 hover:text-white transition-colors"><Mail size={16} /></button>
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"><Share2 size={16} /></button>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <figure className="mb-10 rounded-3xl overflow-hidden shadow-md">
          <img src={POST.image} alt={POST.title} className="w-full h-auto aspect-video object-cover" />
        </figure>

        {/* Article Content */}
        <div 
          className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-a:text-blue-600 prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: POST.content }}
        />

        {/* Footer Tags & Actions */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-700 mr-2">Tags:</span>
            {POST.tags.map(tag => (
              <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 cursor-pointer transition-colors">
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
              <ThumbsUp size={18} /> Hữu ích (124)
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
              <MessageSquare size={18} /> Bình luận (45)
            </button>
          </div>
        </div>

        {/* Author Box */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img src="https://i.pravatar.cc/150?u=tran_tech" alt="Author" className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-sm" />
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-black text-slate-900">Về tác giả: {POST.author}</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">Chuyên gia đánh giá các sản phẩm công nghệ với 5 năm kinh nghiệm. Đam mê các sản phẩm Apple và thiết bị nhiếp ảnh.</p>
            <button className="mt-4 px-4 py-1.5 rounded-full border border-blue-600 text-blue-600 text-xs font-bold hover:bg-blue-50 transition-colors">Theo dõi tác giả</button>
          </div>
        </div>

      </article>
        </div>
      </div>
    </div>
  )
}
