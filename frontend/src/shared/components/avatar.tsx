import React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  className
}) => {
  const [imgError, setImgError] = React.useState(false)

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg'
  }

  const showImage = src && !imgError
  const displayFallback = fallback || (alt ? alt.charAt(0).toUpperCase() : '?')

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-muted",
        sizeClasses[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-medium text-muted-foreground">
          {displayFallback}
        </span>
      )}
    </div>
  )
}

export interface AvatarImageProps {
  src: string
  alt?: string
  className?: string
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  alt,
  className
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
    />
  )
}

export interface AvatarFallbackProps {
  children: React.ReactNode
  className?: string
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({
  children,
  className
}) => {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
    >
      {children}
    </div>
  )
}