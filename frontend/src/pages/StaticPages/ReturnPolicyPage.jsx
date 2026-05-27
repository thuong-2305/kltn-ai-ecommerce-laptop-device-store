import StaticLayout from './components/StaticLayout'

export default function ReturnPolicyPage() {
  return (
    <StaticLayout title="Chính sách đổi trả">
      <h2 className="text-lg font-black text-slate-900 mt-2 mb-4">1. Thời gian áp dụng đổi trả</h2>
      <p>Nhằm đảm bảo quyền lợi cho khách hàng, LaptopDevice hỗ trợ <strong>đổi mới trong vòng 30 ngày</strong> kể từ ngày nhận hàng nếu sản phẩm phát sinh lỗi do nhà sản xuất (phần cứng).</p>

      <h2 className="text-lg font-black text-slate-900 mt-8 mb-4">2. Điều kiện đổi trả</h2>
      <ul className="list-disc pl-5 space-y-2 mt-2">
        <li>Sản phẩm bị lỗi kỹ thuật được xác nhận bởi Trung tâm bảo hành của LaptopDevice hoặc của Hãng.</li>
        <li>Sản phẩm còn nguyên vẹn, không móp méo, trầy xước, không bị vào nước hoặc chập cháy.</li>
        <li>Sản phẩm còn đầy đủ hộp, phụ kiện đi kèm, quà tặng khuyến mãi (nếu có) và hóa đơn mua hàng.</li>
        <li>Tài khoản iCloud, MiCloud, mật khẩu BIOS... (nếu có) phải được thoát hoàn toàn khỏi thiết bị.</li>
      </ul>

      <h2 className="text-lg font-black text-slate-900 mt-8 mb-4">3. Trường hợp không được đổi trả</h2>
      <ul className="list-disc pl-5 space-y-2 mt-2">
        <li>Khách hàng muốn thay đổi chủng loại, mẫu mã nhưng không thông báo trước khi giao hàng.</li>
        <li>Sản phẩm bị lỗi do người sử dụng (rơi vỡ, tự ý tháo lắp, chạy sai điện áp...).</li>
        <li>Không giải quyết đổi trả với các trường hợp sản phẩm là phần mềm bản quyền, mực in, các vật tư tiêu hao.</li>
        <li>Lỗi điểm chết màn hình dưới 5 điểm (tuân theo tiêu chuẩn của các hãng sản xuất màn hình).</li>
      </ul>

      <h2 className="text-lg font-black text-slate-900 mt-8 mb-4">4. Chi phí đổi trả</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="font-bold text-slate-800 mb-1">Lỗi do nhà sản xuất</p>
          <p className="text-sm text-green-600 font-bold">Miễn phí 100%</p>
          <p className="text-xs mt-1 text-slate-500">Bao gồm cả phí vận chuyển hai chiều.</p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="font-bold text-slate-800 mb-1">Lỗi do người dùng / Không ưng ý</p>
          <p className="text-sm text-red-600 font-bold">Từ chối đổi trả / Tính phí theo tình trạng</p>
          <p className="text-xs mt-1 text-slate-500">Khách hàng chịu phí vận chuyển.</p>
        </div>
      </div>
    </StaticLayout>
  )
}
