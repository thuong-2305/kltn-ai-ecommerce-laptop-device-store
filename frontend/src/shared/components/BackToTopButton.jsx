function BackToTopButton() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button type="button" className="back-to-top" onClick={handleScrollToTop} aria-label="Lên đầu trang">
      ↑
    </button>
  )
}

export default BackToTopButton