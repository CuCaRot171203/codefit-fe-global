import { useAppSelector } from '@/store';

type ErrorCode = '404' | '401' | '403' | '500';

interface ErrorCharacterProps {
  code: ErrorCode;
}

const ErrorCharacter = ({ code }: ErrorCharacterProps) => {
  const theme = useAppSelector((state) => state.theme.theme);

  const isDark = theme === 'dark';

  const colors = {
    body: isDark ? '#6366f1' : '#818cf8',
    bodyLight: isDark ? '#818cf8' : '#a5b4fc',
    bodyDark: isDark ? '#4f46e5' : '#6366f1',
    accent: isDark ? '#f472b6' : '#f472b6',
    accentLight: isDark ? '#fb7185' : '#fb923c',
    cheek: isDark ? '#f9a8d4' : '#fbcfe8',
    eye: isDark ? '#1e1b4b' : '#1e1b4b',
    white: '#ffffff',
    shadow: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(99,102,241,0.15)',
    star: isDark ? '#fbbf24' : '#f59e0b',
    starGlow: isDark ? '#fbbf24' : '#f59e0b',
    lock: isDark ? '#94a3b8' : '#64748b',
    lockShackle: isDark ? '#cbd5e1' : '#94a3b8',
    forbidden: isDark ? '#f87171' : '#ef4444',
    server: isDark ? '#fb7185' : '#fb7185',
  };

  const characters: Record<ErrorCode, React.ReactNode> = {
    '404': (
      <g className="animate-search-look">
        {/* Body - round cute blob */}
        <ellipse cx="100" cy="115" rx="45" ry="50" fill={colors.body} />
        <ellipse cx="100" cy="115" rx="38" ry="43" fill={colors.bodyLight} opacity="0.3" />

        {/* Left ear */}
        <ellipse cx="62" cy="68" rx="14" ry="18" fill={colors.body} />
        <ellipse cx="62" cy="68" rx="9" ry="12" fill={colors.bodyLight} opacity="0.4" />
        {/* Right ear */}
        <ellipse cx="138" cy="68" rx="14" ry="18" fill={colors.body} />
        <ellipse cx="138" cy="68" rx="9" ry="12" fill={colors.bodyLight} opacity="0.4" />

        {/* Eyes - big and cute */}
        <ellipse cx="82" cy="108" rx="10" ry="11" fill={colors.white} />
        <ellipse cx="118" cy="108" rx="10" ry="11" fill={colors.white} />
        <ellipse cx="84" cy="109" rx="6" ry="7" fill={colors.eye} />
        <ellipse cx="120" cy="109" rx="6" ry="7" fill={colors.eye} />
        <ellipse cx="86" cy="107" rx="2.5" ry="3" fill={colors.white} />
        <ellipse cx="122" cy="107" rx="2.5" ry="3" fill={colors.white} />

        {/* Eyebrows - confused */}
        <path
          d="M 72 96 Q 82 93 90 97"
          stroke={colors.bodyDark}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 128 93 Q 118 93 110 97"
          stroke={colors.bodyDark}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Blush cheeks */}
        <ellipse cx="68" cy="118" rx="8" ry="5" fill={colors.cheek} opacity="0.6" />
        <ellipse cx="132" cy="118" rx="8" ry="5" fill={colors.cheek} opacity="0.6" />

        {/* Mouth - confused / wavy */}
        <path
          d="M 91 128 Q 95 132 100 128 Q 105 124 110 128"
          stroke={colors.bodyDark}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Search icon (magnifying glass) */}
        <circle
          cx="155"
          cy="65"
          r="12"
          fill={colors.accentLight}
          opacity="0.9"
          className="animate-float-soft"
        />
        <line
          x1="163"
          y1="73"
          x2="172"
          y2="82"
          stroke={colors.accentLight}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="155" cy="65" r="6" fill="none" stroke={colors.white} strokeWidth="1.5" opacity="0.8" />

        {/* Question mark floating */}
        <text
          x="158"
          y="62"
          fontSize="10"
          fontWeight="bold"
          fill={colors.white}
          textAnchor="middle"
          opacity="0.9"
        >
          ?
        </text>
      </g>
    ),

    '401': (
      <g className="animate-knocked">
        {/* Body - sitting cute character */}
        <ellipse cx="100" cy="118" rx="40" ry="45" fill={colors.body} />
        <ellipse cx="100" cy="118" rx="34" ry="38" fill={colors.bodyLight} opacity="0.3" />

        {/* Left ear */}
        <ellipse cx="66" cy="78" rx="12" ry="15" fill={colors.body} />
        <ellipse cx="66" cy="78" rx="7" ry="10" fill={colors.bodyLight} opacity="0.4" />
        {/* Right ear */}
        <ellipse cx="134" cy="78" rx="12" ry="15" fill={colors.body} />
        <ellipse cx="134" cy="78" rx="7" ry="10" fill={colors.bodyLight} opacity="0.4" />

        {/* Eyes - wide, surprised */}
        <ellipse cx="82" cy="108" rx="10" ry="12" fill={colors.white} />
        <ellipse cx="118" cy="108" rx="10" ry="12" fill={colors.white} />
        <ellipse cx="84" cy="110" rx="5.5" ry="6.5" fill={colors.eye} />
        <ellipse cx="120" cy="110" rx="5.5" ry="6.5" fill={colors.eye} />
        <ellipse cx="85.5" cy="108.5" rx="2" ry="2.5" fill={colors.white} />
        <ellipse cx="121.5" cy="108.5" rx="2" ry="2.5" fill={colors.white} />

        {/* Sweat drop */}
        <path
          d="M 138 92 Q 142 88 140 96 Q 138 100 136 96 Q 134 92 138 88"
          fill="#7dd3fc"
          opacity="0.8"
          className="animate-float-soft"
        />

        {/* Mouth - small o (surprised) */}
        <ellipse cx="100" cy="132" rx="7" ry="6" fill={colors.bodyDark} />

        {/* Lock icon (big, overlapping character) */}
        <g className="animate-pulse-glow" style={{ color: colors.lock }}>
          <rect x="145" y="105" width="28" height="22" rx="4" fill={colors.lock} />
          <path
            d="M 152 105 L 152 98 Q 152 88 159 88 Q 166 88 166 98 L 166 105"
            fill="none"
            stroke={colors.lockShackle}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="159" cy="115" r="3.5" fill={colors.white} />
          <rect x="158" y="115" width="2.5" height="6" rx="1" fill={colors.white} />
        </g>

        {/* Door frame (background hint) */}
        <rect
          x="143"
          y="85"
          width="32"
          height="48"
          rx="3"
          fill="none"
          stroke={colors.shadow}
          strokeWidth="2"
          opacity="0.5"
        />
      </g>
    ),

    '403': (
      <g className="animate-tilt-shake">
        {/* Body - standing firm */}
        <ellipse cx="100" cy="115" rx="42" ry="48" fill={colors.body} />
        <ellipse cx="100" cy="115" rx="36" ry="41" fill={colors.bodyLight} opacity="0.3" />

        {/* Left ear */}
        <ellipse cx="64" cy="72" rx="13" ry="17" fill={colors.body} />
        <ellipse cx="64" cy="72" rx="8" ry="11" fill={colors.bodyLight} opacity="0.4" />
        {/* Right ear */}
        <ellipse cx="136" cy="72" rx="13" ry="17" fill={colors.body} />
        <ellipse cx="136" cy="72" rx="8" ry="11" fill={colors.bodyLight} opacity="0.4" />

        {/* Eyes - determined */}
        <ellipse cx="82" cy="106" rx="9" ry="10" fill={colors.white} />
        <ellipse cx="118" cy="106" rx="9" ry="10" fill={colors.white} />
        <ellipse cx="83" cy="108" rx="5" ry="6" fill={colors.eye} />
        <ellipse cx="119" cy="108" rx="5" ry="6" fill={colors.eye} />
        <ellipse cx="84.5" cy="106.5" rx="2" ry="2.5" fill={colors.white} />
        <ellipse cx="120.5" cy="106.5" rx="2" ry="2.5" fill={colors.white} />

        {/* Determined eyebrows */}
        <path
          d="M 73 98 L 90 95"
          stroke={colors.bodyDark}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 127 98 L 110 95"
          stroke={colors.bodyDark}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Blush */}
        <ellipse cx="68" cy="118" rx="8" ry="5" fill={colors.cheek} opacity="0.5" />
        <ellipse cx="132" cy="118" rx="8" ry="5" fill={colors.cheek} opacity="0.5" />

        {/* Mouth - flat / neutral firm */}
        <path
          d="M 91 130 L 109 130"
          stroke={colors.bodyDark}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Hand raised (stop gesture) */}
        <g className="animate-shake-gentle">
          <ellipse cx="148" cy="90" rx="12" ry="10" fill={colors.body} />
          <rect x="143" y="62" width="5" height="18" rx="2.5" fill={colors.body} />
          <rect x="149" y="60" width="5" height="20" rx="2.5" fill={colors.body} />
          <rect x="155" y="62" width="5" height="18" rx="2.5" fill={colors.body} />
          <rect x="161" y="68" width="5" height="12" rx="2.5" fill={colors.body} />
        </g>

        {/* Forbidden circle/slash */}
        <g className="animate-pulse-glow" style={{ color: colors.forbidden }}>
          <circle cx="148" cy="90" r="18" fill="none" stroke={colors.forbidden} strokeWidth="3.5" />
          <line
            x1="133"
            y1="76"
            x2="163"
            y2="104"
            stroke={colors.forbidden}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      </g>
    ),

    '500': (
      <g className="animate-dizzy-stars">
        {/* Body - lying down / exhausted */}
        <ellipse cx="100" cy="125" rx="50" ry="38" fill={colors.body} />
        <ellipse cx="100" cy="125" rx="42" ry="31" fill={colors.bodyLight} opacity="0.3" />

        {/* Eyes - closed / dizzy */}
        <path
          d="M 74 110 Q 82 106 90 110"
          stroke={colors.bodyDark}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 110 110 Q 118 106 126 110"
          stroke={colors.bodyDark}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Mouth - wavy / exhausted */}
        <path
          d="M 88 130 Q 94 127 100 130 Q 106 133 112 130"
          stroke={colors.bodyDark}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Blush - tired red */}
        <ellipse cx="72" cy="118" rx="9" ry="5" fill={colors.server} opacity="0.4" />
        <ellipse cx="128" cy="118" rx="9" ry="5" fill={colors.server} opacity="0.4" />

        {/* X eyes (dizzy) */}
        <g stroke={colors.bodyDark} strokeWidth="2.5" strokeLinecap="round">
          <line x1="76" y1="107" x2="84" y2="115" />
          <line x1="84" y1="107" x2="76" y2="115" />
          <line x1="112" y1="107" x2="120" y2="115" />
          <line x1="120" y1="107" x2="112" y2="115" />
        </g>

        {/* Dizzy stars */}
        <g className="animate-float-soft">
          <text
            x="55"
            y="80"
            fontSize="18"
            fill={colors.star}
            opacity="0.9"
          >
            ★
          </text>
        </g>
        <g className="animate-float-soft" style={{ animationDelay: '0.4s' }}>
          <text
            x="140"
            y="70"
            fontSize="14"
            fill={colors.starGlow}
            opacity="0.8"
          >
            ★
          </text>
        </g>
        <g className="animate-float-soft" style={{ animationDelay: '0.8s' }}>
          <text
            x="100"
            y="60"
            fontSize="20"
            fill={colors.star}
            opacity="0.9"
          >
            ★
          </text>
        </g>
        <g className="animate-float-soft" style={{ animationDelay: '1.2s' }}>
          <text
            x="165"
            y="95"
            fontSize="12"
            fill={colors.starGlow}
            opacity="0.7"
          >
            ★
          </text>
        </g>

        {/* Spiral eyes overlay */}
        <circle cx="80" cy="111" r="6" fill={colors.white} />
        <circle cx="116" cy="111" r="6" fill={colors.white} />
        <path
          d="M 77 111 Q 80 108 83 111 Q 80 114 77 111"
          stroke={colors.bodyDark}
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 113 111 Q 116 108 119 111 Q 116 114 113 111"
          stroke={colors.bodyDark}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Sweat drops */}
        <path
          d="M 55 100 Q 58 95 56 102 Q 54 107 52 102 Q 50 98 55 95"
          fill="#7dd3fc"
          opacity="0.7"
          className="animate-float-soft"
        />
        <path
          d="M 148 85 Q 151 81 149 87 Q 147 91 145 87 Q 143 83 148 81"
          fill="#7dd3fc"
          opacity="0.7"
          className="animate-float-soft"
          style={{ animationDelay: '0.6s' }}
        />

        {/* Wobbly motion lines */}
        <path
          d="M 30 110 Q 38 108 46 110"
          stroke={colors.accent}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
          className="animate-shake-gentle"
        />
        <path
          d="M 154 110 Q 162 108 170 110"
          stroke={colors.accent}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
          className="animate-shake-gentle"
        />
      </g>
    ),
  };

  return (
    <svg
      viewBox="0 0 200 200"
      width="200"
      height="200"
      className="mx-auto drop-shadow-lg"
    >
      <defs>
        <filter id={`glow-${code}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {characters[code]}
    </svg>
  );
};

export default ErrorCharacter;
