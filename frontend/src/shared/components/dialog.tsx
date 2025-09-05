import React from 'react'
import { cn } from '@/lib/utils'

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ 
  open, 
  onOpenChange, 
  children 
}) => {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange?.(false)}
    >
      <div className="fixed inset-0 bg-black/80" />
      <div 
        className="relative z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

export const DialogContent: React.FC<DialogContentProps> = ({ 
  className, 
  children 
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6",
        "max-w-lg w-full mx-4 max-h-[90vh] overflow-auto",
        className
      )}
    >
      {children}
    </div>
  )
}

export interface DialogHeaderProps {
  children: React.ReactNode
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="mb-4">{children}</div>
}

export interface DialogTitleProps {
  children: React.ReactNode
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return (
    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {children}
    </h2>
  )
}

export interface DialogDescriptionProps {
  children: React.ReactNode
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => {
  return (
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
      {children}
    </p>
  )
}

export interface DialogFooterProps {
  children: React.ReactNode
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => {
  return (
    <div className="flex justify-end gap-2 mt-6">
      {children}
    </div>
  )
}