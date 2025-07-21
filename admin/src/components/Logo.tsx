// Logo.tsx
import React from "react";

interface LogoProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  width = "200",
  height = "80",
  className = "",
}) => {
  return (
    <svg
      viewBox="0 0 200 80"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={className}
    >
      {/* Background circle */}
      <circle
        cx="40"
        cy="40"
        r="35"
        fill="#FF6B35"
        stroke="#FF4500"
        strokeWidth="2"
      />

      {/* Delivery box */}
      <rect x="25" y="28" width="20" height="15" fill="#FFF" rx="2" />
      <rect x="27" y="30" width="16" height="2" fill="#FF6B35" />
      <rect x="27" y="34" width="12" height="1.5" fill="#FFB3A1" />
      <rect x="27" y="37" width="8" height="1.5" fill="#FFB3A1" />

      {/* Speed lines */}
      <line
        x1="50"
        y1="30"
        x2="58"
        y2="30"
        stroke="#FFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="35"
        x2="55"
        y2="35"
        stroke="#FFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="40"
        x2="57"
        y2="40"
        stroke="#FFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="45"
        x2="54"
        y2="45"
        stroke="#FFF"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Fork icon */}
      <path
        d="M32 20 L32 15 M30 20 L30 16 M34 20 L34 16 M28 22 L36 22"
        stroke="#FFF"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Company name */}
      <text
        x="90"
        y="35"
        fontFamily="Arial, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="#2C3E50"
      >
        QuickBite
      </text>
      <text
        x="90"
        y="55"
        fontFamily="Arial, sans-serif"
        fontSize="12"
        fill="#7F8C8D"
      >
        Fast Food Delivery
      </text>
    </svg>
  );
};

export default Logo;
