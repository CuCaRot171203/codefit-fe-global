'use client';

import { useSelector } from 'react-redux';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle, Zap, HardDrive, ArrowRight, X, Trophy } from 'lucide-react';
import type { RootState } from '@/store';

interface SubmissionResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNextChallenge?: () => void;
  onViewCode?: () => void;
  result?: {
    passed: number;
    total: number;
    time: number;
    memory: number;
    rank?: string;
    isSuccess: boolean;
  };
}

const SubmissionResultDialog = ({
  open,
  onOpenChange,
  onNextChallenge,
  onViewCode,
  result = {
    passed: 15,
    total: 15,
    time: 45,
    memory: 12.4,
    rank: '12%',
    isSuccess: true,
  },
}: SubmissionResultDialogProps) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        'p-0 max-w-2xl w-full overflow-hidden rounded-2xl border-0',
        isDark ? 'bg-slate-900' : 'bg-white'
      )}>
        {/* Header: Success State */}
        <div className={cn(
          'p-8 flex items-center justify-between border-b',
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-surface-container-low border-surface-container-low'
        )}>
          <div className="flex items-center gap-5">
            <div className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center',
              isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
            )}>
              <CheckCircle className="w-8 h-8" style={{ fill: 'currentColor' }} />
            </div>
            <div>
              <h3 className={cn(
                'text-2xl font-bold font-headline',
                result.isSuccess ? 'text-green-600' : 'text-red-600'
              )}>
                {result.isSuccess ? 'Thành công' : 'Thất bại'}
              </h3>
              <p className={cn(
                'font-medium',
                isDark ? 'text-slate-400' : 'text-on-surface-variant'
              )}>
                Đã vượt qua {result.passed}/{result.total} bộ thử nghiệm
              </p>
            </div>
          </div>
          {result.isSuccess && result.rank && (
            <div className="text-right">
              <span className={cn(
                'text-xs font-bold uppercase tracking-widest block mb-1',
                isDark ? 'text-slate-500' : 'text-gray-400'
              )}>
                Xếp hạng
              </span>
              <span className={cn(
                'text-xl font-bold',
                isDark ? 'text-white' : 'text-on-surface'
              )}>
                Top {result.rank}
              </span>
            </div>
          )}
        </div>

        {/* Body: Metrics & Testcases */}
        <div className={cn(
          'p-8 space-y-8',
          isDark ? 'bg-slate-800/50' : 'bg-surface-container-low/30'
        )}>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className={cn(
              'p-4 rounded-xl flex items-center gap-4 border',
              isDark 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-surface-container-low'
            )}>
              <Zap className={cn('w-6 h-6', isDark ? 'text-blue-400' : 'text-[#0B3C5D]')} />
              <div>
                <p className={cn(
                  'text-[10px] uppercase font-bold tracking-wider mb-1',
                  isDark ? 'text-slate-500' : 'text-gray-400'
                )}>
                  Thời gian chạy
                </p>
                <p className={cn(
                  'text-lg font-bold',
                  isDark ? 'text-white' : 'text-on-surface'
                )}>
                  {result.time}ms
                </p>
              </div>
            </div>
            <div className={cn(
              'p-4 rounded-xl flex items-center gap-4 border',
              isDark 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-surface-container-low'
            )}>
              <HardDrive className={cn('w-6 h-6', isDark ? 'text-blue-400' : 'text-[#0B3C5D]')} />
              <div>
                <p className={cn(
                  'text-[10px] uppercase font-bold tracking-wider mb-1',
                  isDark ? 'text-slate-500' : 'text-gray-400'
                )}>
                  Bộ nhớ sử dụng
                </p>
                <p className={cn(
                  'text-lg font-bold',
                  isDark ? 'text-white' : 'text-on-surface'
                )}>
                  {result.memory} MB
                </p>
              </div>
            </div>
          </div>

          {/* Testcase Breakdown Section */}
          <div>
            <h4 className={cn(
              'text-sm font-bold mb-4 flex items-center gap-2',
              isDark ? 'text-slate-300' : 'text-on-surface-variant'
            )}>
              Chi tiết bộ thử nghiệm
              <span className={cn(
                'flex-1 h-px ml-2',
                isDark ? 'bg-slate-700' : 'bg-surface-container-highest'
              )} />
            </h4>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: Math.min(result.passed, 5) }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-lg p-3 text-center border',
                    isDark
                      ? 'bg-green-900/20 border-green-800'
                      : 'bg-green-50 border-green-100'
                  )}
                >
                  <p className={cn(
                    'text-[10px] font-bold mb-1',
                    isDark ? 'text-green-400' : 'text-green-700'
                  )}>
                    Case {i + 1}
                  </p>
                  <CheckCircle
                    className={cn('w-4 h-4 mx-auto', isDark ? 'text-green-400' : 'text-green-600')}
                    style={{ fill: 'currentColor' }}
                  />
                </div>
              ))}
              {result.passed > 5 && (
                <div className="col-span-5 flex justify-center py-2">
                  <span className={cn(
                    'text-xs font-medium',
                    isDark ? 'text-slate-500' : 'text-gray-400'
                  )}>
                    +{result.passed - 5} bộ thử nghiệm khác thành công
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Premium Progress Pitch */}
          {result.isSuccess && (
            <div className={cn(
              'p-5 rounded-2xl flex items-center justify-between',
              isDark ? 'bg-slate-700' : 'bg-primary-container'
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-full border-4 flex items-center justify-center',
                  isDark
                    ? 'border-slate-600 border-t-amber-400 text-amber-400'
                    : 'border-tertiary-fixed-dim/30 border-t-tertiary-fixed-dim text-white'
                )}>
                  <span className={cn('text-xs font-bold', isDark ? 'text-amber-400' : 'text-white')}>
                    85%
                  </span>
                </div>
                <div>
                  <p className={cn(
                    'font-bold text-sm',
                    isDark ? 'text-slate-200' : 'text-white'
                  )}>
                    Sắp hoàn thành lộ trình!
                  </p>
                  <p className={cn(
                    'text-xs',
                    isDark ? 'text-slate-400' : 'text-on-primary-container'
                  )}>
                    Chỉ còn 3 thử thách để nhận chứng chỉ.
                  </p>
                </div>
              </div>
              <Trophy className={cn(
                'w-8 h-8',
                isDark ? 'text-amber-400' : 'text-tertiary-fixed-dim'
              )} />
            </div>
          )}
        </div>

        {/* Footer: Actions */}
        <div className={cn(
          'p-8 flex flex-col sm:flex-row gap-4',
          isDark ? 'bg-slate-800' : 'bg-white'
        )}>
          {result.isSuccess ? (
            <>
              <Button
                onClick={onNextChallenge}
                className={cn(
                  'flex-1 py-4 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2',
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-primary-container hover:opacity-90 text-white'
                )}
              >
                Thử thách tiếp theo
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={onViewCode}
                variant="outline"
                className={cn(
                  'px-8 py-4 font-bold rounded-xl hover:opacity-80 transition-all',
                  isDark
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 border-slate-600'
                    : 'bg-surface-container-low text-[#0B3C5D] hover:bg-surface-container border-transparent'
                )}
              >
                Xem lại mã
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex-1 py-4 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2',
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-primary-container hover:opacity-90 text-white'
                )}
              >
                Thử lại
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className={cn(
                  'px-8 py-4 font-bold rounded-xl hover:opacity-80 transition-all',
                  isDark
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 border-slate-600'
                    : 'bg-surface-container-low text-[#0B3C5D] hover:bg-surface-container border-transparent'
                )}
              >
                Đóng
              </Button>
            </>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className={cn(
            'absolute right-4 top-4 p-2 rounded-full transition-colors',
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-700'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          )}
        >
          <X className="w-5 h-5" />
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionResultDialog;
