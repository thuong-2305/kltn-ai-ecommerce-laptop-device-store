import { SEMANTIC_CLASSES } from '../../constants/designSystem'
import { FiPhoneCall, FiRefreshCcw, FiShield, FiTruck } from 'react-icons/fi'

function StripIcon({ icon: Icon }) {
  return (
    <span className="grid h-4 w-4 shrink-0 place-items-center text-blue-600" aria-hidden="true">
      <Icon className="h-4 w-4" />
    </span>
  )
}

function TopStrip() {
  return (
    <div className={`px-5 pb-2 pt-3 ${SEMANTIC_CLASSES.TEXT.SECONDARY} text-sm`}>
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 tracking-[0.01em]">
        <span className="inline-flex items-center gap-1.5">
          <StripIcon icon={FiTruck} />
          <span>Miễn phí giao hàng toàn quốc</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <StripIcon icon={FiRefreshCcw} />
          <span>30 ngày đổi trả</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <StripIcon icon={FiShield} />
          <span>Bảo hành chính hãng</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <StripIcon icon={FiPhoneCall} />
          <span>Hotline 1900 1234</span>
        </span>
      </div>
    </div>
  )
}

export default TopStrip