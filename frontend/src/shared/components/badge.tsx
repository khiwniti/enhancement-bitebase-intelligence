import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-500 text-white shadow hover:bg-primary-600',
        secondary: 'border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        destructive: 'border-transparent bg-error-500 text-white shadow hover:bg-error-600',
        success: 'border-transparent bg-success-500 text-white shadow hover:bg-success-600',
        warning: 'border-transparent bg-warning-500 text-white shadow hover:bg-warning-600',
        outline: 'text-neutral-700 border-neutral-300 hover:bg-neutral-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
