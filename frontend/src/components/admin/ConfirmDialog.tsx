import { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string | ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
  variant?: 'danger' | 'warning'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  loading,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card rounded-lg shadow-lg p-6 animate-in fade-in zoom-in-95">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                variant === 'danger' ? 'bg-red-500/10' : 'bg-amber/10'
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${variant === 'danger' ? 'text-red-500' : 'text-amber'}`}
              />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-lg font-semibold text-text-strong mb-2">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-text-muted mb-6">
                {description}
              </Dialog.Description>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  variant="primary"
                  onClick={onConfirm}
                  disabled={loading}
                  className={variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  {loading ? 'Processing...' : confirmLabel}
                </Button>
              </div>
            </div>
          </div>
          <Dialog.Close className="absolute top-4 right-4 text-text-muted hover:text-text-strong">
            <X className="h-4 w-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

