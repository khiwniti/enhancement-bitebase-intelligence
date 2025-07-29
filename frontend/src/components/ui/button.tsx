import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-secondary",
  {
    variants: {
      variant: {
        default: "bg-bitebase-primary text-white hover:bg-bitebase-primary-hover focus:bg-bitebase-primary-hover border-2 border-bitebase-primary hover:border-bitebase-primary-hover",
        destructive: "bg-bitebase-accent text-white hover:bg-bitebase-accent-hover focus:bg-bitebase-accent-hover border-2 border-bitebase-accent hover:border-bitebase-accent-hover",
        outline: "border-2 border-border bg-card text-foreground hover:bg-muted focus:bg-muted hover:border-bitebase-primary",
        secondary: "bg-muted text-foreground hover:bg-muted/80 focus:bg-muted/80 border-2 border-muted hover:border-muted/80",
        ghost: "text-foreground hover:bg-muted focus:bg-muted border-2 border-transparent hover:border-border",
        link: "text-bitebase-primary underline-offset-4 hover:underline focus:underline border-2 border-transparent focus:border-bitebase-primary",
      },
      size: {
        default: "h-10 px-4 py-2 min-w-[44px]", // 44px minimum touch target
        sm: "h-9 rounded-md px-3 min-w-[36px]",
        lg: "h-11 rounded-md px-8 min-w-[44px]",
        icon: "h-10 w-10 min-w-[44px]", // Ensure 44px minimum for touch
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText = "Loading...",
    disabled,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          // Enhanced accessibility styles
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          // High contrast mode support
          "@media (prefers-contrast: high) { border-width: 2px; }",
          // Disabled state improvements
          isDisabled && "opacity-60 cursor-not-allowed hover:bg-current hover:text-current",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        aria-label={loading && loadingText ? loadingText : props['aria-label']}
        type={props.type || "button"}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            role="presentation"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {loading ? loadingText : children}
        
        {/* Screen reader only text for icon buttons */}
        {size === "icon" && !props['aria-label'] && (
          <span className="sr-only">
            Button
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }