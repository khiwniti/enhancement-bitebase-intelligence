import React from 'react'
import { cn } from '@/lib/utils'

export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  options: RadioOption[]
  disabled?: boolean
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  options,
  disabled = false,
  className,
  orientation = 'vertical'
}) => {
  return (
    <div
      role="radiogroup"
      className={cn(
        "grid gap-2",
        orientation === 'horizontal' ? "grid-flow-col" : "grid-flow-row",
        className
      )}
    >
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioItem
            value={option.value}
            checked={value === option.value}
            onCheckedChange={() => onValueChange?.(option.value)}
            disabled={(disabled || option.disabled) ?? false}
          />
          <label
            htmlFor={`radio-${option.value}`}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              (disabled || option.disabled) && "cursor-not-allowed opacity-70"
            )}
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
}

export interface RadioItemProps {
  value: string
  checked?: boolean
  onCheckedChange?: () => void
  disabled?: boolean
  className?: string
}

export const RadioItem = React.forwardRef<HTMLButtonElement, RadioItemProps>(
  ({ value, checked = false, onCheckedChange, disabled = false, className }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={checked}
        id={`radio-${value}`}
        disabled={disabled}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={onCheckedChange}
      >
        {checked && (
          <div className="flex items-center justify-center">
            <div className="h-2.5 w-2.5 rounded-full bg-current" />
          </div>
        )}
      </button>
    )
  }
)

RadioItem.displayName = "RadioItem"