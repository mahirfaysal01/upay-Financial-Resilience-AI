import React, { useState } from 'react';

interface UpayLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon' | 'light';
  height?: number | string;
  alt?: string;
}

export const UpayLogo: React.FC<UpayLogoProps> = ({
  className = '',
  variant = 'full',
  height = 42,
  alt = 'upay',
}) => {
  const [srcIndex, setSrcIndex] = useState(0);

  // Fallback sources list: official URL -> local official copy -> local asset
  const logoSources = [
    '/upay-logo-2024.png',
    'https://www.upaybd.com/images/upay-logo-2024.png',
    '/upaymain.png',
  ];

  const currentSrc = logoSources[srcIndex] || '/upaymain.png';

  const handleError = () => {
    if (srcIndex < logoSources.length - 1) {
      setSrcIndex((prev) => prev + 1);
    }
  };

  // If icon-only
  if (variant === 'icon') {
    return (
      <div
        style={{ height, width: height }}
        className={`relative overflow-hidden rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs ${className}`}
      >
        <img
          src={currentSrc}
          alt={alt}
          onError={handleError}
          className="h-full w-auto max-w-none object-cover object-left transform scale-110"
        />
      </div>
    );
  }

  // Light variant (for dark footer or dark hero background)
  if (variant === 'light') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <img
          src={currentSrc}
          alt={alt}
          onError={handleError}
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
          className="w-auto object-contain shrink-0 filter brightness-0 invert transition-opacity hover:opacity-95"
          loading="eager"
        />
      </div>
    );
  }

  // Default navbar and card logo
  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      className={`w-auto object-contain shrink-0 transition-opacity hover:opacity-95 ${className}`}
      loading="eager"
    />
  );
};
