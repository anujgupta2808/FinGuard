import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { AlertTriangle } from 'lucide-react'

export function ConfirmDialog({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
}) {
  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px" title={title}>
      <div className="confirm-body">
        <div className={`confirm-icon-wrap confirm-icon-${variant}`}>
          <AlertTriangle size={24} />
        </div>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm?.()
              onClose?.()
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
