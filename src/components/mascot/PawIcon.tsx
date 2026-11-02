import React from 'react';

interface PawIconProps {
  className?: string;
  size?: number;
  fill?: string;
}

export const PawIcon: React.FC<PawIconProps> = ({
  className = 'w-5 h-5',
  size = 20,
  fill = 'currentColor',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main palm pad */}
      <path
        d="M12 11.5C9.5 11.5 7.5 13.5 7.5 16C7.5 18 9 20 12 20C15 20 16.5 18 16.5 16C16.5 13.5 14.5 11.5 12 11.5Z"
      />
      {/* Toe pads */}
      <ellipse cx="6" cy="10" rx="1.8" ry="2.4" transform="rotate(-15 6 10)" />
      <ellipse cx="10" cy="7.2" rx="1.8" ry="2.4" transform="rotate(-5 10 7.2)" />
      <ellipse cx="14" cy="7.2" rx="1.8" ry="2.4" transform="rotate(5 14 7.2)" />
      <ellipse cx="18" cy="10" rx="1.8" ry="2.4" transform="rotate(15 18 10)" />
    </svg>
  );
};
