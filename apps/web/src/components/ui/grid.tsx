import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const gridVariants = cva('grid gap-4', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    },
    gap: {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    },
  },
  defaultVariants: { cols: 3, gap: 'md' },
});

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

function Grid({ className, cols, gap, ...props }: GridProps) {
  return <div className={cn(gridVariants({ cols, gap }), className)} {...props} />;
}

const StatCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { label: string; value: string | number; icon?: React.ReactNode; trend?: string }
>(({ className, label, value, icon, trend, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-2', className)}
    {...props}
  >
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {icon && <span className="text-primary">{icon}</span>}
    </div>
    <p className="text-3xl font-bold text-primary">{value}</p>
    {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
  </div>
));
StatCard.displayName = 'StatCard';

export { Grid, StatCard };
