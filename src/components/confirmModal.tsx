import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/contexts/AdminContext';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
  loading = false,
}: ConfirmModalProps) {
  const { isDark } = useAdmin();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-md",
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
      )}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            {variant === 'danger' && (
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isDark ? 'bg-red-900/30' : 'bg-red-100'
              )}>
                <AlertTriangle className={cn(
                  "w-5 h-5",
                  isDark ? 'text-red-400' : 'text-red-600'
                )} />
              </div>
            )}
            <DialogTitle className={cn(
              isDark ? 'text-white' : 'text-slate-900'
            )}>
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className={cn(
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className={cn(
              isDark 
                ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' 
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useConfirmModal() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
  } | null>(null);

  const confirm = (options: {
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
  }) => {
    setConfig(options);
    setOpen(true);
  };

  const Modal = () => {
    if (!config) return null;
    return (
      <ConfirmModal
        open={open}
        onOpenChange={setOpen}
        title={config.title}
        description={config.description}
        onConfirm={() => {
          config.onConfirm();
          setOpen(false);
        }}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        variant={config.variant}
      />
    );
  };

  return { confirm, Modal };
}
