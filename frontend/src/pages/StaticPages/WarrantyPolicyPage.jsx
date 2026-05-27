import StaticLayout from './components/StaticLayout'

export default function WarrantyPolicyPage() {
  return (
    <StaticLayout title="Chính sách bảo hành">
      <h2 className="text-lg font-black text-slate-900 mt-2 mb-4">1. Điều kiện bảo hành</h2>
      <p>Tất cả sản phẩm do LaptopDevice bán ra đều tuân thủ điều kiện bảo hành của Hãng sản xuất. Các trường hợp được bảo hành miễn phí bao gồm:</p>
      <ul className="list-disc pl-5 space-y-2 mt-2">
        <li>Sản phẩm còn trong thời hạn bảo hành (tính từ ngày mua hàng ghi trên hóa đơn hoặc hệ thống).</li>
        <li>Sản phẩm bị lỗi kỹ thuật do nhà sản xuất.</li>
        <li>Tem bảo hành (nếu có) phải còn nguyên vẹn, không bị rách rời, cạo sửa, chắp vá.</li>
        <li>Số Serial/IMEI/Service Tag trên sản phẩm phải còn nguyên vẹn, rõ nét và khớp với thông tin mua hàng.</li>
      </ul>

      <h2 className="text-lg font-black text-slate-900 mt-8 mb-4">2. Các trường hợp từ chối bảo hành</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Sản phẩm hết thời hạn bảo hành.</li>
        <li>Hư hỏng do người dùng gây ra như: rơi vỡ, móp méo, trầy xước, vào nước, cháy nổ do sai nguồn điện.</li>
        <li>Tự ý tháo dỡ, sửa chữa bởi các cá nhân hoặc trung tâm không được sự ủy quyền của LaptopDevice hoặc Hãng.</li>
        <li>Thiệt hại do thiên tai, hỏa hoạn, động vật côn trùng xâm nhập.</li>
        <li>Các lỗi phần mềm, mất dữ liệu (khách hàng vui lòng tự sao lưu dữ liệu trước khi mang máy đi bảo hành).</li>
      </ul>

      <h2 className="text-lg font-black text-slate-900 mt-8 mb-4">3. Thời gian xử lý bảo hành</h2>
      <p>
        - Với các lỗi đơn giản: Xử lý ngay tại trung tâm bảo hành của LaptopDevice trong vòng <strong>24 - 48 giờ làm việc</strong>.<br/>
        - Với các lỗi phức tạp cần gửi về hãng: Thời gian xử lý từ <strong>7 - 14 ngày làm việc</strong> (không tính thứ 7, Chủ Nhật và các ngày lễ).
      </p>

      <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-2">Trung tâm bảo hành LaptopDevice</h3>
        <p className="text-sm text-blue-700">
          <strong>Địa chỉ:</strong> 123 Đường ABC, Phường 1, Quận 1, TP. HCM<br/>
          <strong>Hotline CSKH:</strong> 1900 1234<br/>
          <strong>Giờ làm việc:</strong> 8:00 - 17:30 (Từ Thứ 2 đến Thứ 7)
        </p>
      </div>
    </StaticLayout>
  )
}
