import React from 'react';

interface UpayLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon';
  height?: number | string;
  showSubtitle?: boolean;
}

export const UpayLogo: React.FC<UpayLogoProps> = ({
  className = '',
  variant = 'full',
  height = 42,
  showSubtitle = true,
}) => {
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height }}
        className={`w-auto shrink-0 select-none ${className}`}
        aria-label="upay Financial Resilience AI Emblem"
      >
        {/* Yellow Figure (Left) */}
        <circle cx="70" cy="62" r="26" fill="#FFB800" />
        <path
          d="M 70,102 C 48,102 28,118 24,140 C 18,168 28,198 58,212 C 86,226 122,222 146,202 C 148,200 147,195 142,191 C 128,183 110,185 92,183 C 67,179 51,166 51,148 C 51,131 62,118 78,115 C 82,114 84,102 70,102 Z"
          fill="#FFB800"
        />

        {/* Blue Figure (Right) */}
        <circle cx="170" cy="62" r="26" fill="#0055D4" />
        <path
          d="M 170,102 C 192,102 212,118 216,140 C 222,168 212,198 182,212 C 154,226 118,222 94,202 C 92,200 93,195 98,191 C 112,183 130,185 148,183 C 173,179 189,166 189,148 C 189,131 178,118 162,115 C 158,114 156,102 170,102 Z"
          fill="#0055D4"
        />

        {/* Shield in Center */}
        <g id="shield">
          <path
            d="M 88,96 L 152,96 C 152,96 156,138 120,168 C 84,138 88,96 88,96 Z"
            fill="#00875A"
          />
          {/* 3 White Bar Chart Bars */}
          <rect x="101" y="140" width="7" height="14" rx="2" fill="#FFFFFF" />
          <rect x="113" y="131" width="7" height="23" rx="2" fill="#FFFFFF" />
          <rect x="125" y="122" width="7" height="32" rx="2" fill="#FFFFFF" />
          {/* White Rising Trend Arrow */}
          <path
            d="M 100,138 Q 115,126 134,112"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 124,111 L 135,111 L 135,122"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
    );
  }

  // Full and Compact variants
  const viewBoxWidth = variant === 'compact' ? 570 : 680;

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} 200`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ height }}
      className={`w-auto shrink-0 select-none ${className}`}
      aria-label="upay Financial Resilience AI"
    >
      <defs>
        <clipPath id="u-left-clip-comp">
          <rect x="250" y="30" width="48" height="100" />
        </clipPath>
        <clipPath id="u-right-clip-comp">
          <rect x="298" y="30" width="45" height="100" />
        </clipPath>
      </defs>

      {/* ==================== LEFT EMBLEM ==================== */}
      <g id="emblem" transform="translate(10, 0)">
        {/* Yellow Figure (Left) */}
        <circle cx="82" cy="54" r="21" fill="#FFB800" />
        <path
          d="M 82,86 C 65,86 48,98 44,116 C 39,138 48,162 72,174 C 95,185 125,182 144,166 C 146,164 145,160 141,157 C 130,150 115,152 100,150 C 80,147 67,136 67,122 C 67,108 76,98 88,96 C 92,95 94,86 82,86 Z"
          fill="#FFB800"
        />

        {/* Blue Figure (Right) */}
        <circle cx="182" cy="54" r="21" fill="#0055D4" />
        <path
          d="M 182,86 C 199,86 216,98 220,116 C 225,138 216,162 192,174 C 169,185 139,182 120,166 C 118,164 119,160 123,157 C 134,150 149,152 164,150 C 184,147 197,136 197,122 C 197,108 188,98 176,96 C 172,95 170,86 182,86 Z"
          fill="#0055D4"
        />

        {/* Shield in Center */}
        <g id="shield">
          <path
            d="M 107,82 L 157,82 C 157,82 160,115 132,139 C 104,115 107,82 107,82 Z"
            fill="#00875A"
          />
          <path
            d="M 110,85 L 132,85 L 132,135 C 112,116 110,92 110,85 Z"
            fill="#00A86B"
            opacity="0.25"
          />
          <rect x="117" y="117" width="5.5" height="11" rx="1.5" fill="#FFFFFF" />
          <rect x="126" y="110" width="5.5" height="18" rx="1.5" fill="#FFFFFF" />
          <rect x="135" y="103" width="5.5" height="25" rx="1.5" fill="#FFFFFF" />
          <path
            d="M 116,115 Q 128,106 142,95"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 134,94 L 143,94 L 143,103"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </g>

      {/* ==================== VERTICAL DIVIDER ==================== */}
      <line
        x1="242"
        y1="50"
        x2="242"
        y2="152"
        stroke="#CBD5E1"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* ==================== WORDMARK "Upay" ==================== */}
      <g id="wordmark">
        {/* Yellow Left Half of U */}
        <path
          d="M 268,52 L 288,52 L 288,96 C 288,106 293,112 304,112 C 315,112 320,106 320,96 L 320,52 L 340,52 L 340,96 C 340,119 326,130 304,130 C 282,130 268,119 268,96 Z"
          fill="#FFB800"
          clipPath="url(#u-left-clip-comp)"
        />
        {/* Blue Right Half of U */}
        <path
          d="M 268,52 L 288,52 L 288,96 C 288,106 293,112 304,112 C 315,112 320,106 320,96 L 320,52 L 340,52 L 340,96 C 340,119 326,130 304,130 C 282,130 268,119 268,96 Z"
          fill="#0055D4"
          clipPath="url(#u-right-clip-comp)"
        />

        {/* Letter 'p' */}
        <path
          d="M 346,65 L 364,65 L 364,74 C 370,66 380,63 391,63 C 409,63 422,77 422,98 C 422,119 409,133 391,133 C 380,133 370,129 364,122 L 364,154 L 346,154 Z M 364,98 C 364,110 372,117 383,117 C 394,117 402,110 402,98 C 402,86 394,79 383,79 C 372,79 364,86 364,98 Z"
          fill="#0B1F4B"
        />

        {/* Letter 'a' */}
        <path
          d="M 465,65 L 483,65 L 483,131 L 466,131 L 466,122 C 460,129 451,133 440,133 C 425,133 414,123 414,108 C 414,91 428,83 452,82 L 465,81 L 465,78 C 465,72 459,68 450,68 C 442,68 435,71 431,76 L 421,65 C 429,56 441,53 456,53 C 462,53 465,54 465,65 Z M 465,95 L 454,96 C 441,97 433,101 433,108 C 433,115 440,119 449,119 C 459,119 465,112 465,103 Z"
          fill="#0B1F4B"
        />

        {/* Letter 'y' */}
        <path
          d="M 488,65 L 508,65 L 524,112 L 540,65 L 560,65 L 534,134 C 525,156 513,164 495,164 C 488,164 481,162 476,159 L 483,144 C 486,146 490,147 494,147 C 503,147 510,142 514,130 Z"
          fill="#0B1F4B"
        />
      </g>

      {/* ==================== SUBTITLE "Financial Resilience AI" ==================== */}
      {showSubtitle && (
        <text
          x="269"
          y="160"
          fill="#0B1F4B"
          fontFamily="'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="22"
          fontWeight="600"
          letterSpacing="0.4"
        >
          Financial Resilience AI
        </text>
      )}
    </svg>
  );
};
