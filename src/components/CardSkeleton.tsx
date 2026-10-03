import React from 'react';

export interface CardSkeletonProps {
  /**
   * Layout variant that mimics different .upay-card styles across the app
   * - 'default': Standard insight/feature card with badge, heading, body lines, and action button
   * - 'kpi': Compact metric stat card with label, large number, and delta indicator
   * - 'chart': Data visualizer skeleton with header, main chart canvas area, and axis markers
   * - 'list': Transaction/activity item list skeleton with row items
   * - 'insight': AI recommendation card with sparkle badge, advice text, and action button
   */
  variant?: 'default' | 'kpi' | 'chart' | 'list' | 'insight';
  /** Number of text description lines in default variant (default: 3) */
  lines?: number;
  /** Custom additional className for the outer .upay-card container */
  className?: string;
  /** Whether to show the top badge placeholder (default: true) */
  showHeaderBadge?: boolean;
  /** Whether to show the bottom button/action placeholder (default: true) */
  showAction?: boolean;
  /** Number of skeleton cards to render (default: 1) */
  count?: number;
}

/**
 * CardSkeleton
 * 
 * Reusable skeleton loader that precisely matches the .upay-card styling, border-radius,
 * and padding while utilizing the .skeleton-shimmer animation class. Provides a smooth,
 * high-fidelity placeholder experience while AI models, Firestore, or Gemini services are fetching data.
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  variant = 'default',
  lines = 3,
  className = '',
  showHeaderBadge = true,
  showAction = true,
  count = 1,
}) => {
  const renderSingleSkeleton = (index: number) => {
    switch (variant) {
      case 'kpi':
        return (
          <div
            key={index}
            className={`upay-card p-5 space-y-3 relative overflow-hidden ${className}`}
            role="status"
            aria-label="Loading metric..."
          >
            {/* Top Label & Micro Icon */}
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded-md skeleton-shimmer" />
              <div className="w-5 h-5 rounded-full skeleton-shimmer" />
            </div>

            {/* Large Bold Metric Number */}
            <div className="h-7 w-36 rounded-lg skeleton-shimmer my-1.5" />

            {/* Subtitle / Delta indicator */}
            <div className="h-3 w-48 rounded-md skeleton-shimmer" />
          </div>
        );

      case 'chart':
        return (
          <div
            key={index}
            className={`upay-card p-6 space-y-4 relative overflow-hidden ${className}`}
            role="status"
            aria-label="Loading chart data..."
          >
            {/* Header: Title & Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded-full skeleton-shimmer" />
                <div className="h-5 w-48 rounded-md skeleton-shimmer" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-20 rounded-full skeleton-shimmer" />
                <div className="h-7 w-20 rounded-full skeleton-shimmer" />
              </div>
            </div>

            {/* Chart Area Simulated Grid & Shimmer Canvas */}
            <div className="h-52 w-full rounded-2xl bg-slate-50/80 p-4 flex items-end gap-3 justify-between relative overflow-hidden border border-slate-100">
              <div className="absolute inset-0 skeleton-shimmer opacity-35 pointer-events-none" />
              {/* Simulated Chart Bars/Columns */}
              <div className="w-full flex items-end justify-between gap-2 h-full z-10 pt-4">
                {[45, 75, 30, 90, 60, 85, 40].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-lg skeleton-shimmer opacity-75"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Legend / Axis Ticks */}
            <div className="flex justify-between items-center pt-1">
              <div className="h-3 w-16 rounded skeleton-shimmer" />
              <div className="h-3 w-16 rounded skeleton-shimmer" />
              <div className="h-3 w-16 rounded skeleton-shimmer" />
              <div className="h-3 w-16 rounded skeleton-shimmer" />
            </div>
          </div>
        );

      case 'list':
        return (
          <div
            key={index}
            className={`upay-card p-6 space-y-4 relative overflow-hidden ${className}`}
            role="status"
            aria-label="Loading list items..."
          >
            {/* List Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="h-5 w-40 rounded-md skeleton-shimmer" />
              <div className="h-4 w-20 rounded-full skeleton-shimmer" />
            </div>

            {/* List Row Items */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl skeleton-shimmer shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 rounded skeleton-shimmer" />
                      <div className="h-3 w-20 rounded skeleton-shimmer" />
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="h-4 w-16 rounded skeleton-shimmer ml-auto" />
                    <div className="h-3 w-12 rounded skeleton-shimmer ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'insight':
        return (
          <div
            key={index}
            className={`upay-card p-6 space-y-4 relative overflow-hidden border-amber-200/80 bg-amber-50/20 ${className}`}
            role="status"
            aria-label="AI analyzing data..."
          >
            {/* AI Sparkle Badge */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full skeleton-shimmer shrink-0" />
              <div className="h-4 w-36 rounded-full skeleton-shimmer" />
            </div>

            {/* Headline */}
            <div className="h-6 w-3/4 rounded-lg skeleton-shimmer" />

            {/* Description lines */}
            <div className="space-y-2 pt-1">
              <div className="h-3.5 w-full rounded skeleton-shimmer" />
              <div className="h-3.5 w-5/6 rounded skeleton-shimmer" />
              <div className="h-3.5 w-2/3 rounded skeleton-shimmer" />
            </div>

            {/* Recommended Action Pill / Button */}
            <div className="pt-2 flex items-center gap-3">
              <div className="h-9 w-36 rounded-xl skeleton-shimmer" />
              <div className="h-9 w-24 rounded-xl skeleton-shimmer" />
            </div>
          </div>
        );

      case 'default':
      default:
        return (
          <div
            key={index}
            className={`upay-card p-6 space-y-4 relative overflow-hidden ${className}`}
            role="status"
            aria-label="Loading card content..."
          >
            {/* Header Badge & Action */}
            {showHeaderBadge && (
              <div className="flex items-center justify-between pb-1">
                <div className="h-5 w-28 rounded-full skeleton-shimmer" />
                <div className="w-6 h-6 rounded-full skeleton-shimmer" />
              </div>
            )}

            {/* Title Line */}
            <div className="h-6 w-3/5 rounded-lg skeleton-shimmer mt-1" />

            {/* Content Lines */}
            <div className="space-y-2 pt-1">
              {Array.from({ length: lines }).map((_, i) => {
                // Vary line widths for natural reading appearance
                const widthClass =
                  i === 0 ? 'w-full' : i === 1 ? 'w-11/12' : i === 2 ? 'w-4/5' : 'w-2/3';
                return <div key={i} className={`h-3.5 ${widthClass} rounded skeleton-shimmer`} />;
              })}
            </div>

            {/* Bottom Action / Button */}
            {showAction && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="h-8 w-28 rounded-xl skeleton-shimmer" />
                <div className="h-4 w-16 rounded skeleton-shimmer" />
              </div>
            )}
          </div>
        );
    }
  };

  if (count <= 1) {
    return renderSingleSkeleton(0);
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => renderSingleSkeleton(index))}
    </>
  );
};

export default CardSkeleton;
