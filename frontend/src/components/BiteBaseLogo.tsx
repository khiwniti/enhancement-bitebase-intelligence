import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface BiteBaseLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "dark" | "gradient";
  clickable?: boolean;
  href?: string;
  animated?: boolean;
}

const sizeMap = {
  xs: { icon: 20, text: "text-sm" },
  sm: { icon: 28, text: "text-base" },
  md: { icon: 36, text: "text-lg" },
  lg: { icon: 44, text: "text-xl" },
  xl: { icon: 56, text: "text-2xl" },
  "2xl": { icon: 72, text: "text-3xl" },
  "3xl": { icon: 96, text: "text-4xl" },
};

export default function BiteBaseLogo({
  size = "md",
  className = "",
  showText = true,
  variant = "default",
  clickable = true,
  href = "/",
  animated = false,
}: BiteBaseLogoProps) {
  const [imageError, setImageError] = useState(false);

  // Ensure size is valid, fallback to 'md' if not
  const validSize = size && sizeMap[size] ? size : "md";
  const { icon: iconSize, text: textSize } = sizeMap[validSize];

  const getTextColor = () => {
    switch (variant) {
      case "white":
        return "text-white";
      case "dark":
        return "text-foreground";
      case "gradient":
        return "bg-gradient-to-r from-bitebase-primary to-bitebase-accent bg-clip-text text-transparent";
      default:
        return "text-foreground";
    }
  };

  const logoContent = (
    <div
      className={`flex items-center ${animated ? "transition-all duration-300 hover:scale-105" : ""} ${className}`}
    >
      <div className="relative flex-shrink-0">
        {!imageError ? (
          <Image
            src="/logo.png"
            alt="BiteBase Logo"
            width={iconSize * 3.2} // Better visibility for logo
            height={iconSize}
            className={`object-contain ${animated ? "transition-transform duration-300 hover:rotate-12" : ""}`}
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          // Enhanced SVG logo with proper BiteBase branding
          <div
            className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-[#74C365] to-[#5fa854] text-white font-bold shadow-lg ${animated ? "transition-transform duration-300 hover:rotate-12" : ""}`}
            style={{
              width: `${iconSize}px`,
              height: `${iconSize}px`,
            }}
          >
            <svg
              width={iconSize * 0.6}
              height={iconSize * 0.6}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                fill="currentColor"
              />
              <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.8"/>
              <path
                d="M8 12C8 10.9 8.9 10 10 10H14C15.1 10 16 10.9 16 12V14C16 15.1 15.1 16 14 16H10C8.9 16 8 15.1 8 14V12Z"
                fill="currentColor"
                opacity="0.6"
              />
            </svg>
          </div>
        )}
      </div>

      {showText && (
        <div className="ml-2 flex items-center">
          <span className={`font-bold ${textSize} ${getTextColor()}`}>
            BiteBase
          </span>
        </div>
      )}
    </div>
  );

  if (clickable && href) {
    return (
      <div
        className={`inline-flex ${animated ? "transition-opacity duration-300 hover:opacity-80" : ""}`}
      >
        <Link href={href} aria-label="BiteBase - Home">
          {logoContent}
        </Link>
      </div>
    );
  }

  return logoContent;
}

// Icon-only version for smaller spaces
export function BiteBaseIcon({
  size = "md",
  className = "",
  variant = "default",
  animated = false,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "white" | "dark" | "gradient";
  animated?: boolean;
}) {
  const [imageError, setImageError] = useState(false);

  // Ensure size is valid, fallback to 'md' if not
  const validSize = size && sizeMap[size] ? size : "md";
  const iconSize = sizeMap[validSize].icon;

  return (
    <div className={`relative ${className}`}>
      {!imageError ? (
        <Image
          src="/logo.png"
          alt="BiteBase"
          width={iconSize * 2.2} // Better visibility for logo
          height={iconSize}
          className={`object-contain ${animated ? "transition-transform duration-300 hover:scale-110 hover:rotate-12" : ""}`}
          priority
          onError={() => setImageError(true)}
        />
      ) : (
        // Enhanced SVG icon with proper BiteBase branding
        <div
          className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-[#74C365] to-[#5fa854] text-white font-bold shadow-lg ${animated ? "transition-transform duration-300 hover:scale-110 hover:rotate-12" : ""}`}
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
          }}
        >
          <svg
            width={iconSize * 0.6}
            height={iconSize * 0.6}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
              fill="currentColor"
            />
            <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.8"/>
            <path
              d="M8 12C8 10.9 8.9 10 10 10H14C15.1 10 16 10.9 16 12V14C16 15.1 15.1 16 14 16H10C8.9 16 8 15.1 8 14V12Z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// Animated loading version
export function BiteBaseLogoLoading({
  size = "md",
  className = "",
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  // Ensure size is valid, fallback to 'md' if not
  const validSize = size && sizeMap[size] ? size : "md";
  const iconSize = sizeMap[validSize].icon;

  return (
    <div className={`flex items-center ${className}`}>
      <div
        className="flex items-center justify-center rounded-xl bg-gradient-to-br from-[#74C365] to-[#5fa854] text-white font-bold shadow-lg animate-pulse"
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
        }}
      >
        <svg
          width={iconSize * 0.6}
          height={iconSize * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
            fill="currentColor"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.8"/>
          <path
            d="M8 12C8 10.9 8.9 10 10 10H14C15.1 10 16 10.9 16 12V14C16 15.1 15.1 16 14 16H10C8.9 16 8 15.1 8 14V12Z"
            fill="currentColor"
            opacity="0.6"
          />
        </svg>
      </div>
      <div className="ml-2 flex items-center">
        <div className="h-4 bg-gray-300 rounded animate-pulse w-20"></div>
        <div className="ml-1 h-3 bg-gray-200 rounded animate-pulse w-16"></div>
      </div>
    </div>
  );
}

// Compact version for mobile/small screens
export function BiteBaseLogoCompact({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "white" | "dark" | "gradient";
}) {
  return (
    <BiteBaseLogo
      size="sm"
      showText={false}
      variant={variant}
      className={className}
      animated={true}
    />
  );
}
