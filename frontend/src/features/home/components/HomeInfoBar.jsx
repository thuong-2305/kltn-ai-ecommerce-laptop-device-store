import { Fragment } from 'react'
import { SEMANTIC_CLASSES } from '../../../constants/designSystem'

function HomeInfoBar() {
  const items = [
    {
      icon: '/delivery-icon.png',
      alt: 'Delivery Icon',
      title: 'Giao hàng',
      subtitle: 'từ 20K',
    },
    {
      icon: '/feedback-icon.png',
      alt: 'Feedback Icon',
      title: '99% Khách hàng',
      subtitle: 'phản hồi',
    },
    {
      icon: '/return-icon.png',
      alt: 'Return Icon',
      title: '365 Ngày',
      subtitle: 'trả miễn phí',
    },
    {
      icon: '/payment-icon.png',
      alt: 'Payment Icon',
      title: 'Thanh toán',
      subtitle: 'an toàn',
    },
    {
      icon: '/best-brands-icon.png',
      alt: 'Brands Icon',
      title: 'Tốt nhất',
      subtitle: 'Các thương hiệu',
    },
  ]

  return (
    <section className="mx-4.5 mb-8" id="info-bar" aria-label="Thông tin cửa hàng">
      <div className={`border ${SEMANTIC_CLASSES.BORDER.DEFAULT} rounded-2xl bg-white/80 p-5 shadow-standard flex flex-wrap md:flex-nowrap justify-between md:justify-around items-center gap-4 md:gap-0`}>
        {items.map((item, index) => (
          <Fragment key={item.title}>
            <div className="flex items-center justify-start flex-1 min-w-[150px] md:min-w-0 group cursor-pointer px-2">
              <div className="relative w-[30px] h-[30px] mr-2.5 overflow-hidden flex-shrink-0">
                <img
                  src={item.icon}
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full transition-all duration-200 ease-linear [transform:translateY(0)] opacity-100 group-hover:[transform:translateY(-100%)] group-hover:opacity-0 z-10"
                />
                <img
                  src={item.icon}
                  alt={`Hover ${item.alt}`}
                  className="absolute inset-0 w-full h-full transition-all duration-200 ease-linear [transform:rotateY(0deg)_translateY(100%)] opacity-0 [backface-visibility:visible] z-0 group-hover:[transform:rotateY(-180deg)_translateY(0)] group-hover:opacity-100"
                />
              </div>
              <div className="leading-tight">
                <strong className="text-slate-900 font-bold text-sm md:text-[16px] transition-colors duration-200 group-hover:text-blue-600">
                  {item.title}
                </strong>
                <br />
                <span className="text-slate-500 text-xs md:text-[15px]">
                  {item.subtitle}
                </span>
              </div>
            </div>
            {index < items.length - 1 && (
              <div className="hidden md:block h-10 w-[1px] bg-slate-200 flex-shrink-0" />
            )}
          </Fragment>
        ))}
      </div>
    </section>
  )
}

export default HomeInfoBar
