import React from 'react';

interface SetuLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  variant?: 'gradient' | 'mono';
}

export default function SetuLogo({
  size = 24,
  className = '',
  variant = 'gradient',
  ...props
}: SetuLogoProps) {
  const gradientId = React.useId();

  if (variant === 'mono') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 44H60" strokeWidth="4" />
          <path d="M18 12V52M46 12V52" strokeWidth="4" />
          <path d="M4 44L18 14Q32 54 46 14L60 44" strokeWidth="3" />
          <path d="M25 30.5V44M32 34V44M39 30.5V44" strokeWidth="2.2" />
        </g>
        <g fill="currentColor">
          <circle cx="18" cy="13" r="4" />
          <circle cx="46" cy="13" r="4" />
          <circle cx="32" cy="34" r="3.6" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="64"
          y2="0"
        >
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <path
        d="M4 44H60"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M18 12V52M46 12V52"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M4 44L18 14Q32 54 46 14L60 44"
        stroke={`url(#${gradientId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25 30.5V44M32 34V44M39 30.5V44"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="18" cy="13" r="4" fill={`url(#${gradientId})`} />
      <circle cx="46" cy="13" r="4" fill={`url(#${gradientId})`} />
      <circle cx="32" cy="34" r="3.6" fill={`url(#${gradientId})`} />
    </svg>
  );
}
