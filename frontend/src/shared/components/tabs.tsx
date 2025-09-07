import React from 'react'
import { cn } from '@/lib/utils'

export interface TabsProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  orientation?: 'horizontal' | 'vertical'
  className?: string
  children: React.ReactNode
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  defaultValue,
  orientation = 'horizontal',
  className,
  children
}) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || '')

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue)
    onValueChange?.(tabValue)
  }

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])

  return (
    <div
      className={cn(
        "w-full",
        orientation === 'vertical' && "flex gap-4",
        className
      )}
      data-orientation={orientation}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            activeTab,
            onTabChange: handleTabChange,
            orientation
          } as any)
        }
        return child
      })}
    </div>
  )
}

export interface TabsListProps {
  className?: string
  children: React.ReactNode
  activeTab?: string
  onTabChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
}

export const TabsList: React.FC<TabsListProps> = ({
  className,
  children,
  activeTab,
  onTabChange,
  orientation = 'horizontal'
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        orientation === 'vertical' && "flex-col h-fit",
        className
      )}
      role="tablist"
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            activeTab,
            onTabChange,
            orientation
          } as any)
        }
        return child
      })}
    </div>
  )
}

export interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
  activeTab?: string
  onTabChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className,
  disabled = false,
  activeTab,
  onTabChange,
  orientation = 'horizontal'
}) => {
  const isActive = activeTab === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium",
        "ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-background text-foreground shadow-sm",
        !isActive && "hover:bg-background/50",
        orientation === 'vertical' && "w-full justify-start",
        className
      )}
      onClick={() => !disabled && onTabChange?.(value)}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
  activeTab?: string
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className,
  activeTab
}) => {
  if (activeTab !== value) {
    return null
  }

  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  )
}