import StaticLayout from './components/StaticLayout'

export default function AboutPage() {
  return (
    <StaticLayout title="Giới thiệu LaptopDevice">
      <h2 className="text-lg font-black text-slate-900 mt-2 mb-4">Về LaptopDevice</h2>
      <p>
        <strong>LaptopDevice</strong> là một trong những nhà bán lẻ hàng đầu tại Việt Nam chuyên cung cấp các dòng sản phẩm máy tính xách tay (laptop), linh kiện, và phụ kiện công nghệ chính hãng. Với phương châm <em>"Công nghệ cho cuộc sống"</em>, chúng tôi cam kết mang đến cho khách hàng những sản phẩm chất lượng tốt nhất cùng dịch vụ hậu mãi chuẩn mực.
      </p>

      <h2 className="text-lg font-black text-slate-900 mt-8 mb-4">Tầm nhìn & Sứ mệnh</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Tầm nhìn:</strong> Trở thành hệ thống bán lẻ các sản phẩm công nghệ uy tín và được yêu thích nhất tại Việt Nam.</li>
        <li><strong>Sứ mệnh:</strong> Mang đến cho khách hàng những trải nghiệm mua sắm tuyệt vời, cung cấp các sản phẩm công nghệ hiện đại với mức giá tốt nhất, đi kèm với dịch vụ tư vấn và chăm sóc khách hàng tận tâm.</li>
      </ul>

      <h2 className="text-lg font-black text-slate-900 mt-8 mb-4">Vì sao chọn chúng tôi?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <h3 className="font-bold text-blue-600 mb-2">1. Sản phẩm chính hãng</h3>
          <p className="text-sm">Cam kết 100% sản phẩm phân phối là hàng chính hãng, đầy đủ giấy tờ và bảo hành từ nhà sản xuất.</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <h3 className="font-bold text-blue-600 mb-2">2. Giá cả cạnh tranh</h3>
          <p className="text-sm">Luôn cập nhật các chương trình khuyến mãi, đảm bảo mức giá tốt nhất trên thị trường cho khách hàng.</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <h3 className="font-bold text-blue-600 mb-2">3. Đội ngũ chuyên nghiệp</h3>
          <p className="text-sm">Nhân viên am hiểu công nghệ, sẵn sàng hỗ trợ kỹ thuật và tư vấn nhiệt tình.</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <h3 className="font-bold text-blue-600 mb-2">4. Dịch vụ tận tâm</h3>
          <p className="text-sm">Hỗ trợ giao hàng siêu tốc, đổi trả dễ dàng và bảo hành tận nơi nhanh chóng.</p>
        </div>
      </div>
    </StaticLayout>
  )
}
