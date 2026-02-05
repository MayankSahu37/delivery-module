'use client';

interface CircularProgressProps {
    value: number;
    max: number;
    label: string;
    color?: string;
    size?: number;
}

export default function CircularProgress({
    value,
    max,
    label,
    color = '#4f46e5',
    size = 120
}: CircularProgressProps) {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="circular-progress-container">
            <svg width={size} height={size} className="circular-progress-svg">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="circular-progress-bar"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
                {/* Center text */}
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy="0.3em"
                    className="circular-progress-text"
                    fill={color}
                >
                    {value}
                </text>
            </svg>
            <p className="circular-progress-label">{label}</p>
        </div>
    );
}
