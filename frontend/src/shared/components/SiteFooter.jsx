function SiteFooter() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-grid">
        <div>
          <div className="brand-mark brand-mark--footer">TECHZONE</div>
          <p>TechZone là hệ thống bán lẻ laptop và thiết bị công nghệ dành cho mọi nhu cầu.</p>
        </div>
        <div>
          <h4>Về chúng tôi</h4>
          <a href="#hero">Giới thiệu</a>
          <a href="#featured">Tuyển dụng</a>
          <a href="#news">Tin tức</a>
          <a href="#footer">Liên hệ</a>
        </div>
        <div>
          <h4>Chính sách</h4>
          <a href="#footer">Chính sách bảo hành</a>
          <a href="#footer">Chính sách đổi trả</a>
          <a href="#footer">Chính sách vận chuyển</a>
          <a href="#footer">Bảo mật thông tin</a>
        </div>
        <div>
          <h4>Đăng ký nhận tin</h4>
          <p>Nhận thông báo khuyến mãi mới nhất.</p>
          <label className="footer-subscribe">
            <input type="email" placeholder="Nhập email của bạn" />
            <button type="button">Đăng ký</button>
          </label>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2024 TechZone. All rights reserved.</span>
        <div className="payment-badges">
          <span>VISA</span>
          <span>Mastercard</span>
          <span>MoMo</span>
          <span>ZaloPay</span>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter