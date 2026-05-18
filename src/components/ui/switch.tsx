import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            'w-11 h-6 rounded-full peer transition-colors duration-200',
            'peer-checked:bg-cyan-500',
            'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50',
            "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
            'after:bg-white after:rounded-full after:h-5 after:w-5',
            'after:transition-all duration-200',
            'peer-checked:after:translate-x-full peer-checked:after:border-white',
            'dark:bg-slate-600 bg-slate-300',
            className
          )}
        />
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
