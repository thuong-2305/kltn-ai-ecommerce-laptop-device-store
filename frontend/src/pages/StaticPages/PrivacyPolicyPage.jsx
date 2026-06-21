import StaticLayout from './components/StaticLayout'

export default function PrivacyPolicyPage() {
  return (
    <StaticLayout title="Bảo mật thông tin">
      <h2 className="text-lg font-black text-slate-900 mt-2 mb-4">1. Mục đích thu thập thông tin cá nhân</h2>
      <p>Việc thu thập dữ liệu chủ yếu trên LaptopDevice bao gồm: họ tên, email, số điện thoại, địa chỉ nhận hàng. Đây là các thông tin mà chúng tôi cần quý khách cung cấp bắt buộc khi đăng ký sử dụng dịch vụ và để liên hệ xác nhận khi quý khách đặt mua hàng trên website nhằm đảm bảo quyền lợi cho cho người tiêu dùng.</p>

      <h2 className="text-lg font-black text-slate-900 mt-8 mb-4">2. Phạm vi sử dụng thông tin</h2>
      <p>Website sử dụng thông tin thành viên cung cấp để:</p>
      <ul className="list-disc pl-5 space-y-2 mt-2">
        <li>Cung cấp các dịch vụ/sản phẩm đến khách hàng.</li>
        <li>Gửi các thông báo về các hoạt động trao đổi thông tin giữa khách hàng và LaptopDevice (như mã xác nhận, tình trạng đơn hàng).</li>
        <li>Ngừa các hoạt động phá hủy tài khoản người dùng của khách hàng hoặc các hoạt động giả mạo khách hàng.</li>
        <li>Liên lạc và giải quyết với khách hàng trong những trường hợp đặc biệt (bảo hành, khiếu nại).</li>
        <li>Không sử dụng thông tin cá nhân của khách hàng ngoài mục đích xác nhận và liên hệ có liên quan đến giao dịch tại LaptopDevice.</li>
      </ul>

      <h2 className="text-lg font-black text-slate-900 mt-8 mb-4">3. Thời gian lưu trữ thông tin</h2>
      <p>Dữ liệu cá nhân của Thành viên sẽ được lưu trữ cho đến khi có yêu cầu hủy bỏ hoặc tự thành viên đăng nhập và thực hiện hủy bỏ. Còn lại trong mọi trường hợp thông tin cá nhân thành viên sẽ được bảo mật trên máy chủ của LaptopDevice.</p>

      <h2 className="text-lg font-black text-slate-900 mt-8 mb-4">4. Những người hoặc tổ chức có thể tiếp cận thông tin</h2>
      <p>Chúng tôi không tiết lộ, bán hoặc chia sẻ thông tin cá nhân của quý khách cho bất kỳ bên thứ ba nào, ngoại trừ các trường hợp sau:</p>
      <ul className="list-disc pl-5 space-y-2 mt-2">
        <li>Đối tác vận chuyển (chỉ cung cấp tên, số điện thoại và địa chỉ nhận hàng).</li>
        <li>Đối tác cổng thanh toán (chỉ cung cấp thông tin mã đơn hàng, số tiền).</li>
        <li>Khi có yêu cầu hợp pháp từ cơ quan pháp luật có thẩm quyền.</li>
      </ul>

      <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200">
        <h3 className="font-bold text-amber-800 mb-1">Cam kết bảo mật</h3>
        <p className="text-sm text-amber-700">Thông tin cá nhân của bạn được cam kết bảo mật tuyệt đối. Chúng tôi sử dụng các biện pháp an ninh mạng tối ưu nhất (Mã hoá HTTPS, chuẩn SSL, mã hóa mật khẩu) để bảo vệ dữ liệu chống lại việc mất mát, lạm dụng hoặc thay đổi.</p>
      </div>
    </StaticLayout>
  )
}
