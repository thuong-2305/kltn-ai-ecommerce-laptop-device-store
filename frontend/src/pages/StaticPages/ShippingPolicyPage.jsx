import StaticLayout from './components/StaticLayout'

export default function ShippingPolicyPage() {
  return (
    <StaticLayout title="Chính sách vận chuyển">
      <h2 className="text-lg font-black text-slate-900 mt-2 mb-4">1. Phạm vi giao hàng</h2>
      <p>LaptopDevice hỗ trợ giao hàng trên toàn quốc (áp dụng cho tất cả 63 tỉnh thành). Chúng tôi hợp tác với các đơn vị vận chuyển uy tín như Giao Hàng Nhanh, Viettel Post, J&T Express để đảm bảo hàng hóa đến tay bạn an toàn và nhanh nhất.</p>

      <h2 className="text-lg font-black text-slate-900 mt-8 mb-4">2. Thời gian giao hàng dự kiến</h2>
      <ul className="list-disc pl-5 space-y-2 mt-2">
        <li><strong>Nội thành TP.HCM & Hà Nội:</strong> Nhận hàng ngay trong ngày (đối với dịch vụ giao hàng siêu tốc) hoặc từ 1 - 2 ngày làm việc đối với giao hàng tiêu chuẩn.</li>
        <li><strong>Khu vực Tỉnh/Thành phố khác:</strong> Từ 2 - 4 ngày làm việc.</li>
        <li><strong>Khu vực Huyện/Xã vùng sâu vùng xa:</strong> Từ 3 - 6 ngày làm việc.</li>
      </ul>
      <p className="text-sm italic text-slate-500 mt-3">* Lưu ý: Thời gian giao hàng có thể bị ảnh hưởng bởi điều kiện thời tiết, thiên tai hoặc các dịp lễ Tết.</p>

      <h2 className="text-lg font-black text-slate-900 mt-8 mb-4">3. Phí vận chuyển</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 mt-2">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-800">Khu vực</th>
              <th className="px-4 py-3 font-bold text-slate-800">Giá trị đơn hàng</th>
              <th className="px-4 py-3 font-bold text-slate-800">Phí vận chuyển</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-4 py-3 font-medium">Nội thành TP.HCM/Hà Nội</td>
              <td className="px-4 py-3">Bất kỳ</td>
              <td className="px-4 py-3 text-green-600 font-bold">Miễn phí</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Ngoại thành & Các tỉnh khác</td>
              <td className="px-4 py-3">&ge; 500,000₫</td>
              <td className="px-4 py-3 text-green-600 font-bold">Miễn phí</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Ngoại thành & Các tỉnh khác</td>
              <td className="px-4 py-3">&lt; 500,000₫</td>
              <td className="px-4 py-3">30,000₫</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-black text-slate-900 mt-8 mb-4">4. Đồng kiểm khi nhận hàng</h2>
      <p>Khách hàng được quyền kiểm tra tình trạng ngoại quan của bưu kiện (còn nguyên seal, không móp méo, rách vỡ) và mở hộp kiểm tra số lượng, loại sản phẩm trước khi thanh toán. (Không hỗ trợ cắm điện dùng thử đối với các sản phẩm điện tử nguyên seal).</p>
    </StaticLayout>
  )
}
