import React from 'react';

interface HappyCatProps {
  className?: string;
  size?: number;
  message?: string;
}

export const HappyCat: React.FC<HappyCatProps> = ({
  className = '',
  size = 140,
  message,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="happyFurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B69AFF" />
            <stop offset="100%" stopColor="#7047D7" />
          </linearGradient>

          <radialGradient id="sparkleGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF8EE" />
            <stop offset="100%" stopColor="#FFD9E4" />
          </radialGradient>
        </defs>

        {/* Happy bouncy cat body */}
        <g className="animate-[bounce_1.2s_ease-in-out_infinite] origin-bottom">
          {/* Main Body */}
          <ellipse cx="100" cy="140" rx="55" ry="45" fill="url(#happyFurGrad)" />

          {/* White Chest Patch */}
          <ellipse cx="100" cy="145" rx="28" ry="24" fill="#FFF8EE" />

          {/* Head */}
          <circle cx="100" cy="90" r="44" fill="url(#happyFurGrad)" />

          {/* Left Ear with pink inner */}
          <path d="M68 64 L50 24 C60 26, 80 40, 82 58 Z" fill="#7047D7" />
          <path d="M66 56 L55 33 C62 35, 74 44, 76 53 Z" fill="#FFD9E4" />

          {/* Right Ear with pink inner */}
          <path d="M132 64 L150 24 C140 26, 120 40, 118 58 Z" fill="#7047D7" />
          <path d="M134 56 L145 33 C138 35, 126 44, 124 53 Z" fill="#FFD9E4" />

          {/* Joyful closed arched eyes (smiling ^_^) */}
          <path
            d="M74 88 Q84 76 94 88"
            fill="none"
            stroke="#24203D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M106 88 Q116 76 126 88"
            fill="none"
            stroke="#24203D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Rosy blush cheeks */}
          <ellipse cx="72" cy="98" rx="8" ry="5" fill="#FFD9E4" />
          <ellipse cx="128" cy="98" rx="8" ry="5" fill="#FFD9E4" />

          {/* Tiny button nose */}
          <polygon points="97,97 103,97 100,101" fill="#FFD9E4" stroke="#24203D" strokeWidth="1" />

          {/* Cute 3-shaped cat mouth */}
          <path
            d="M93 104 Q100 109 100 102 Q100 109 107 104"
            fill="none"
            stroke="#24203D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* White Whiskers */}
          <path d="M60 97 L38 94 M60 103 L40 107" stroke="#FFF8EE" strokeWidth="2" strokeLinecap="round" />
          <path d="M140 97 L162 94 M140 103 L160 107" stroke="#FFF8EE" strokeWidth="2" strokeLinecap="round" />

          {/* Left Paw resting */}
          <ellipse cx="75" cy="140" rx="12" ry="9" fill="#FFF8EE" />

          {/* Raised Right Paw waving & holding a golden copy star */}
          <g className="animate-[wiggle_1s_ease-in-out_infinite] origin-[130px_130px]">
            <ellipse cx="138" cy="115" rx="13" ry="10" transform="rotate(-30 138 115)" fill="#FFF8EE" />
            {/* Cute paw pads */}
            <circle cx="138" cy="114" r="4" fill="#FFD9E4" />
            <circle cx="132" cy="108" r="1.8" fill="#FFD9E4" />
            <circle cx="138" cy="106" r="1.8" fill="#FFD9E4" />
            <circle cx="144" cy="109" r="1.8" fill="#FFD9E4" />
          </g>

          {/* Tail wagging */}
          <path
            d="M145 155 Q180 150 175 120 Q170 110 180 105"
            fill="none"
            stroke="#7047D7"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </g>

        {/* Sparkles / Stars around happy cat */}
        <g fill="#B69AFF">
          {/* Sparkle 1 */}
          <path
            d="M40 50 Q48 50 48 42 Q48 50 56 50 Q48 50 48 58 Q48 50 40 50 Z"
            fill="#FFF8EE"
            className="animate-pulse"
          />
          {/* Sparkle 2 */}
          <path
            d="M165 45 Q171 45 171 39 Q171 45 177 45 Q171 45 171 51 Q171 45 165 45 Z"
            fill="#FFD9E4"
            className="animate-ping"
            style={{ animationDuration: '2s' }}
          />
        </g>
      </svg>

      {message && (
        <span className="mt-2 text-xs font-semibold text-[#7047D7] dark:text-[#B69AFF] tracking-wide text-center">
          {message}
        </span>
      )}
    </div>
  );
};
