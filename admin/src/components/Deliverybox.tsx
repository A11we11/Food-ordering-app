interface DeliveryBoxIconProps {
  style?: React.CSSProperties;
  className?: string;
  width?: string | number;
  height?: string | number;
  size?: string | number;
}

const DeliveryBoxIcon: React.FC<DeliveryBoxIconProps> = ({
  style,
  className,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className={className}
      width={width}
      height={height}
      {...props}
    >
      {/* Box shadow */}
      <path
        d="M25 80 L25 160 L120 190 L175 160 L175 80 L100 50 Z"
        fill="#2a2a2a"
        opacity="0.2"
      />

      {/* Main box body */}
      <path
        d="M20 75 L20 155 L115 185 L170 155 L170 75 L95 45 Z"
        fill="#8B4513"
        stroke="#654321"
        strokeWidth="2"
      />

      {/* Box top face */}
      <path d="M20 75 L95 45 L170 75 L95 105 Z" fill="#CD853F" />

      {/* Box right face */}
      <path d="M95 105 L170 75 L170 155 L115 185 Z" fill="#A0522D" />

      {/* Tape lines */}
      <rect
        x="85"
        y="50"
        width="20"
        height="130"
        fill="#FFD700"
        opacity="0.8"
        transform="rotate(15 95 115)"
      />
      <rect
        x="85"
        y="45"
        width="20"
        height="20"
        fill="#FFD700"
        opacity="0.8"
        transform="rotate(15 95 55)"
      />

      {/* Box edges for depth */}
      <line x1="20" y1="75" x2="95" y2="45" stroke="#654321" strokeWidth="2" />
      <line x1="95" y1="45" x2="170" y2="75" stroke="#654321" strokeWidth="2" />
      <line
        x1="170"
        y1="75"
        x2="95"
        y2="105"
        stroke="#654321"
        strokeWidth="2"
      />
      <line x1="95" y1="105" x2="20" y2="75" stroke="#654321" strokeWidth="2" />

      {/* Delivery symbol/arrow */}
      <g transform="translate(95, 90)">
        <circle r="25" fill="#ffffff" opacity="0.9" />
        <path
          d="M-15 -5 L5 -5 L5 -12 L18 0 L5 12 L5 5 L-15 5 Z"
          fill="#2E8B57"
        />
      </g>

      {/* Optional text label */}
      <text
        x="95"
        y="170"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fontWeight="bold"
        fill="#2a2a2a"
      ></text>
    </svg>
  );
};

export default DeliveryBoxIcon;
