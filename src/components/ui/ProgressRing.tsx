interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor?: string;
  children?: React.ReactNode;
  className?: string;
}

const ProgressRing = ({
  progress,
  size = 80,
  strokeWidth = 6,
  color,
  bgColor = "hsl(var(--secondary))",
  children,
  className
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className || ""}`}>
      <svg
        width={size}
        height={size}
        className="progress-ring overflow-visible"
      >
        <defs>
          <radialGradient id="ring-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#D4C555" stopOpacity="1" />
            <stop offset="100%" stopColor="#D4C555" stopOpacity="0.4" />
          </radialGradient>
          <filter id="inner-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="opacity-20"
        />

        {/* Progress circle with Glow */}
        <circle
          stroke="url(#ring-glow)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="progress-ring-circle transition-all duration-700 ease-out"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            filter: "drop-shadow(0 0 8px #D4C555)",
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default ProgressRing;
