import React, { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export function Toast({
  message,
  type = 'success',
  onClose,
  duration = 3200,
}) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      onClose?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  const icons = {
    success: <CheckCircle2 size={18} className="toast-type-icon text-success" />,
    error: <AlertCircle size={18} className="toast-type-icon text-danger" />,
    info: <Info size={18} className="toast-type-icon text-primary" />,
  }

  return (
    <div className={`fg-toast fg-toast-${type}`} role="alert">
      {icons[type] || icons.success}
      <span className="toast-message">{message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  )
}
