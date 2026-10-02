import React from 'react';

interface UpayLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon';
  height?: number | string;
  alt?: string;
}

export const UpayLogo: React.FC<UpayLogoProps> = ({
  className = '',
  variant = 'full',
  height = 44,
  alt = 'upay Financial Resilience AI',
}) => {
  // If explicitly requesting icon-only (e.g., small favicon/badge)
  if (variant === 'icon') {
    return (
      <div
        style={{ height, width: height }}
        className={`relative overflow-hidden rounded-xl bg-white flex items-center justify-center shrink-0 ${className}`}
      >
        <img
          src="/upaymain.png"
          alt={alt}
          className="h-full w-auto max-w-none object-cover object-left transform scale-125"
        />
      </div>
    );
  }

  // Primary site logo using public/upaymain.png
  return (
    <img
      src="/upaymain.png"
      alt={alt}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      className={`w-auto object-contain shrink-0 transition-opacity hover:opacity-95 ${className}`}
      loading="eager"
    />
  );
};
