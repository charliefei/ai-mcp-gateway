import * as React from 'react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const Icon =
    variant === 'destructive' ? AlertTriangle : title.includes('成功') ? CheckCircle2 : Info
  const iconWrap =
    variant === 'destructive'
      ? 'bg-destructive/10 text-destructive ring-destructive/20'
      : 'bg-primary/10 text-primary ring-primary/20'

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="sm">
      <DialogHeader className="border-b-0 pb-2">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${iconWrap}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription className="mt-1.5">{description}</DialogDescription>
            )}
          </div>
        </div>
      </DialogHeader>
      <DialogFooter className="border-t-0 bg-transparent">
        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'default'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? '处理中...' : confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
