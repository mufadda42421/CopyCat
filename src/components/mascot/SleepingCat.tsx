import React from 'react';

interface SleepingCatProps {
  className?: string;
  size?: number;
}

export const SleepingCat: React.FC<SleepingCatProps> = ({
  className = '',
  size = 180,
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size * 0.8}
        viewBox="0 0 240 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Soft shadow under the pillow */}
          <radialGradient id="catShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7047D7" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#7047D7" stopOpacity="0" />
          </radialGradient>

          {/* Pillow gradient */}
          <linearGradient id="pillowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF8EE" />
            <stop offset="100%" stopColor="#FFD9E4" />
          </linearGradient>

          {/* Fur gradient */}
          <linearGradient id="furGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B69AFF" />
            <stop offset="100%" stopColor="#7047D7" />
          </linearGradient>

          <linearGradient id="furHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#B69AFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="120" cy="170" rx="90" ry="14" fill="url(#catShadow)" />

        {/* Soft rounded cushion/pillow */}
        <path
          d="M35 152 C35 130, 80 120, 120 120 C160 120, 205 130, 205 152 C205 174, 160 178, 120 178 C80 178, 35 174, 35 152 Z"
          fill="url(#pillowGrad)"
          stroke="#B69AFF"
          strokeWidth="2.5"
          className="dark:opacity-90"
        />

        {/* Breathing animated group */}
        <g className="animate-[pulse_3.5s_ease-in-out_infinite] origin-[120px_130px]">
          {/* Curled cat body */}
          <path
            d="M65 142 C50 115, 65 75, 110 70 C155 65, 185 95, 180 135 C175 160, 140 165, 105 160 C80 157, 70 152, 65 142 Z"
            fill="url(#furGrad)"
          />
          {/* Subtle body highlight */}
          <path
            d="M80 115 C75 90, 100 78, 125 78 C150 78, 165 92, 162 110 C140 98, 105 102, 80 115 Z"
            fill="url(#furHighlight)"
          />

          {/* Curled tail wrapped around body */}
          <path
            d="M178 135 C195 140, 195 162, 175 165 C150 168, 135 160, 128 152"
            fill="none"
            stroke="#7047D7"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Tail white tip */}
          <circle cx="128" cy="152" r="4.5" fill="#FFF8EE" />

          {/* Cat Head tucked in */}
          <circle cx="95" cy="115" r="32" fill="url(#furGrad)" />

          {/* Left Ear */}
          <path
            d="M72 96 L62 66 C68 68, 82 76, 84 88 Z"
            fill="#7047D7"
          />
          <path
            d="M71 90 L65 72 C68 74, 76 79, 78 86 Z"
            fill="#FFD9E4"
          />

          {/* Right Ear */}
          <path
            d="M106 90 L122 66 C120 74, 118 84, 114 94 Z"
            fill="#7047D7"
          />
          <path
            d="M108 88 L118 72 C116 77, 114 83, 112 90 Z"
            fill="#FFD9E4"
          />

          {/* Sleeping closed eyes (cute curved crescents) */}
          <path
            d="M80 114 Q86 120 92 114"
            fill="none"
            stroke="#24203D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M98 114 Q104 120 110 114"
            fill="none"
            stroke="#24203D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Cute pink button nose */}
          <polygon points="93,121 97,121 95,124" fill="#FFD9E4" stroke="#24203D" strokeWidth="0.8" />

          {/* Whisker lines */}
          <path d="M74 121 L60 120 M75 125 L61 127" stroke="#FFF8EE" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M115 121 L129 120 M114 125 L128 127" stroke="#FFF8EE" strokeWidth="1.5" strokeLinecap="round" />

          {/* Blushing cheeks */}
          <ellipse cx="76" cy="120" rx="4" ry="2.5" fill="#FFD9E4" opacity="0.8" />
          <ellipse cx="114" cy="120" rx="4" ry="2.5" fill="#FFD9E4" opacity="0.8" />

          {/* Tucked front paw */}
          <ellipse cx="106" cy="138" rx="8" ry="6" fill="#FFF8EE" />
          <path d="M103 136 L103 141 M107 136 L107 141" stroke="#B69AFF" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Floating "Z z z" bubbles with staggered float animation */}
        <g className="font-bold text-[#7047D7] dark:text-[#B69AFF]">
          <text
            x="160"
            y="75"
            fontSize="16"
            className="animate-bounce font-mono opacity-80"
            style={{ animationDuration: '3s' }}
          >
            z
          </text>
          <text
            x="176"
            y="56"
            fontSize="21"
            className="animate-bounce font-mono opacity-90"
            style={{ animationDuration: '2.5s', animationDelay: '0.4s' }}
          >
            Z
          </text>
          <text
            x="195"
            y="35"
            fontSize="26"
            className="animate-bounce font-mono font-black"
            style={{ animationDuration: '2s', animationDelay: '0.8s' }}
          >
            Z
          </text>
        </g>
      </svg>
    </div>
  );
};
